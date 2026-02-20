import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import {
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  catchError, take
} from 'rxjs/operators';

import { UserService } from '../../../../services/user.service';
import { StakeholdersService } from '../../../../services/stakeholders.service';
import { SurveyService } from '../../../../services/survey.service';

import { Paging } from '../../../../../catalogue-ui/domain/paging';
import { Model } from '../../../../../catalogue-ui/domain/dynamic-form-model';
import { Administrator } from '../../../../domain/userInfo';
import { URLParameter } from '../../../../domain/url-parameter';
import { SurveyInfo } from '../../../../domain/survey';

type AnswersMap = Record<string, boolean | null>;

@Injectable({ providedIn: 'root' })
export class AdminSurveysFacade {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);
  private surveyService = inject(SurveyService);

  /** Trigger a refresh of surveys (and survey-answer aggregation) */
  private readonly refresh$ = new Subject<void>();

  /**
   * Administrator stream:
   * - prefer currentAdministrator from userService or session storage
   * - fallback to route param id -> fetch admin and set currentAdministrator
   */
  readonly administrator$ = this.userService.currentAdministrator.pipe(
    switchMap((admin: Administrator) => {
      if (admin) return of(admin);

      // Try sessionStorage
      const stored = sessionStorage.getItem('currentAdministrator');
      if (stored) {
        try {
          const parsed: Administrator = JSON.parse(stored);

          // hydrate service so the rest of the app stays consistent
          this.userService.changeCurrentAdministrator(parsed);

          return of(parsed);
        } catch {
          // corrupted storage, ignore it
          sessionStorage.removeItem('currentAdministrator');
        }
      }

      // if current admin not present, try route param id
      return this.route.params.pipe(
        map(params => params['id']),
        filter(Boolean),
        switchMap((id: string) =>
          this.stakeholdersService.getAdministratorById(id).pipe(
            tap(found => this.userService.changeCurrentAdministrator(found))
          )
        )
      );
    }),
    // Use refCount: true when the stream must die when the component dies, else the stream lives as long as the app.
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Surveys stream — reacts to administrator and refresh trigger.
   * startWith ensures we fetch immediately once admin is resolved.
   */
  readonly surveys$ = this.administrator$.pipe(
    filter(Boolean),
    switchMap((admin: Administrator) =>
      this.refresh$.pipe(
        startWith(undefined as void), // forces an initial emission of the refresh$ subject.
        switchMap(() => this.surveyService.getSurveys('type', admin.type))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  ) as ReturnType<typeof this.surveyService.getSurveys>;

  /**
   * Aggregated map: { [surveyId]: hasAnswers }
   * - a single stream using forkJoin to avoid leaving N open subscriptions
   * - if paging results is empty we return {}
   */
  readonly surveyAnswersMap$ = this.surveys$.pipe(
    switchMap((paging: Paging<Model> | null) => {
      if (!paging?.results?.length) return of({} as AnswersMap);

      // we need current admin id for URL params
      // use the latest value from administrator$ (safe because paging exists only after admin)
      return this.administrator$.pipe(
        take(1),
        switchMap(admin => {
          const calls = paging.results.map(model => {
            const params: URLParameter[] = [
              { key: 'groupId', values: [admin.id] },
              { key: 'surveyId', values: [model.id] }
            ];

            return this.surveyService.getSurveyEntries(params).pipe(
              map((res: Paging<SurveyInfo>) => ({
                id: model.id,
                hasAnswers: !!res?.total
              })),
              // If survey entries fail, set hasAnswers to null to differentiate from empty paging
              catchError(() => of({ id: model.id, hasAnswers: null }))
            );
          });

          return forkJoin(calls).pipe(
            map(results =>
              results.reduce((acc, cur) => {
                acc[cur.id] = cur.hasAnswers;
                return acc;
              }, {} as AnswersMap)
            )
          );
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Trigger a refresh from outside (component or other consumers)
   */
  refresh(): void {
    this.refresh$.next();
  }

  /**
   * Returns an Observable for generating answers.
   * We also expose generateAndRefresh() below for convenience (it subscribes internally).
   */
  generateAnswers$(surveyId: string) {
    return this.surveyService.generateAnswers(surveyId).pipe(
      tap(() => this.refresh()), // refresh on success
      catchError(err => {
        // rethrow or transform for the caller to handle
        throw err;
      })
    );
  }

  /**
   * Convenience: fire-and-forget with internal handling for UI actions.
   * This will subscribe internally, so callers (components) don't need to subscribe.
   * This is handy for UI button handlers where you don't want to repeat .subscribe everywhere.
   */
  generateAnswersAndRefresh(surveyId: string): void {
    // subscribe and swallow errors (but log them). If you want to bubble errors, use generateAnswers$ above.
    this.generateAnswers$(surveyId).subscribe({
      next: () => {
        // intentionally empty; tap() already triggered refresh()
      },
      error: (err) => {
        console.error('Failed to generate answers for', surveyId, err);
      }
    });
  }
}
