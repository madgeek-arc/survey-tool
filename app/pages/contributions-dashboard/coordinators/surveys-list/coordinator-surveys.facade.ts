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
  catchError,
  take
} from 'rxjs/operators';

import { UserService } from '../../../../services/user.service';
import { StakeholdersService } from '../../../../services/stakeholders.service';
import { SurveyService } from '../../../../services/survey.service';

import { Paging } from '../../../../../catalogue-ui/domain/paging';
import { Model } from '../../../../../catalogue-ui/domain/dynamic-form-model';
import { Coordinator } from '../../../../domain/userInfo';
import { URLParameter } from '../../../../domain/url-parameter';
import { SurveyInfo } from '../../../../domain/survey';

export type ResponseCounts = { responded: number; total: number };
type AnswersMap = Record<string, ResponseCounts | null>;

@Injectable({ providedIn: 'root' })
export class CoordinatorSurveysFacade {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);
  private surveyService = inject(SurveyService);

  /** Trigger a refresh of surveys (and survey-answer aggregation) */
  private readonly refresh$ = new Subject<void>();

  /**
   * Coordinator stream:
   * - prefer currentCoordinator from userService or session storage
   * - fallback to route param id -> fetch coordinator and set currentCoordinator
   */
  readonly coordinator$ = this.userService.currentCoordinator.pipe(
    switchMap((coordinator: Coordinator) => {
      if (coordinator) return of(coordinator);

      const stored = sessionStorage.getItem('currentCoordinator');
      if (stored) {
        try {
          const parsed: Coordinator = JSON.parse(stored);
          this.userService.changeCurrentCoordinator(parsed);
          return of(parsed);
        } catch {
          sessionStorage.removeItem('currentCoordinator');
        }
      }

      return this.route.params.pipe(
        map(params => params['id']),
        filter(Boolean),
        switchMap((id: string) =>
          this.stakeholdersService.getCoordinatorById(id).pipe(
            tap(found => this.userService.changeCurrentCoordinator(found))
          )
        )
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Surveys stream — reacts to coordinator and refresh trigger.
   * startWith ensures we fetch immediately once coordinator is resolved.
   */
  readonly surveys$ = this.coordinator$.pipe(
    filter(Boolean),
    switchMap((coordinator: Coordinator) =>
      this.refresh$.pipe(
        startWith(undefined as void),
        switchMap(() => this.surveyService.getSurveys('type', coordinator.type))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  ) as ReturnType<typeof this.surveyService.getSurveys>;

  /**
   * Aggregated map: { [surveyId]: hasAnswers }
   * Uses forkJoin to check answer existence for all surveys in parallel.
   */
  readonly surveyAnswersMap$ = this.surveys$.pipe(
    switchMap((paging: Paging<Model> | null) => {
      if (!paging?.results?.length) return of({} as AnswersMap);

      return this.coordinator$.pipe(
        take(1),
        switchMap(coordinator => {
          const calls = paging.results.map(model => {
            const params: URLParameter[] = [
              { key: 'groupId', values: [coordinator.id] },
              { key: 'surveyId', values: [model.id] }
            ];

            return this.surveyService.getSurveyEntries(params).pipe(
              map((res: Paging<SurveyInfo>) => ({
                id: model.id,
                counts: res ? {
                  responded: res.results?.filter(s => s.validated || s.published).length ?? 0,
                  total: res.total ?? 0
                } : null
              })),
              catchError(() => of({ id: model.id, counts: null as ResponseCounts | null }))
            );
          });

          return forkJoin(calls).pipe(
            map(results =>
              results.reduce((acc, cur) => {
                acc[cur.id] = cur.counts;
                return acc;
              }, {} as AnswersMap)
            )
          );
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  refresh(): void {
    this.refresh$.next();
  }

  generateAnswers$(surveyId: string) {
    return this.surveyService.generateAnswers(surveyId).pipe(
      tap(() => this.refresh()),
      catchError(err => {
        throw err;
      })
    );
  }

  generateAnswersAndRefresh(surveyId: string): void {
    this.generateAnswers$(surveyId).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Failed to generate answers for', surveyId, err);
      }
    });
  }

  activateSurvey$(surveyId: string, closeDate?: string | null) {
    return this.surveyService.getSurvey(surveyId).pipe(
      switchMap((model: Model) => {
        model.active = true;
        if (closeDate) model.submissionCloseAt = closeDate;
        return this.surveyService.updateSurvey(surveyId, model);
      }),
      tap(() => this.refresh()),
      catchError(err => {
        throw err;
      })
    );
  }

  deactivateSurvey$(surveyId: string) {
    return this.surveyService.getSurvey(surveyId).pipe(
      switchMap((model: Model) => {
        model.active = false;
        return this.surveyService.updateSurvey(surveyId, model);
      }),
      tap(() => this.refresh()),
      catchError(err => {
        throw  err;
      })
    )
  }

  activateAndRefresh(surveyId: string, closeDate?: string | null): void {
    this.activateSurvey$(surveyId, closeDate).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Failed to activate survey', surveyId, err);
      }
    });
  }

  deactivateAndRefresh(surveyId: string): void {
    this.deactivateSurvey$(surveyId).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Failed to deactivate survey', err);
      }
    })
  }

  updateDates$(survey: Model, startDate: string | null, closeDate: string | null) {
    const updated = Object.assign(new Model(), survey, { submissionStartAt: startDate, submissionCloseAt: closeDate });
    return this.surveyService.updateSurvey(survey.id, updated).pipe(
      tap(() => this.refresh()),
      catchError(err => {
        throw err;
      })
    );
  }

  updateDatesAndRefresh(survey: Model, startDate: string | null, closeDate: string | null): void {
    this.updateDates$(survey, startDate, closeDate).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Failed to update dates for survey', survey.id, err);
      }
    });
  }
}
