import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CoordinatorSurveysFacade, ResponseCounts } from './coordinator-surveys.facade';
import { NotificationSettingsService } from '../../../../services/notification-settings.service';
import { SurveyModalsService } from '../../../../services/survey-modals.service';
import { Model } from '../../../../../catalogue-ui/domain/dynamic-form-model';
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Coordinator } from '../../../../domain/userInfo';

@Component({
    selector: 'app-survey-lists',
    templateUrl: 'surveys-list.component.html',
    standalone: false
})
export class SurveysListComponent implements OnInit {
  private readonly facade = inject(CoordinatorSurveysFacade);
  protected readonly notifSettings = inject(NotificationSettingsService);
  protected readonly modals = inject(SurveyModalsService);

  private readonly coordinator = toSignal(this.facade.coordinator$, { initialValue: null });
  readonly surveys = toSignal(this.facade.surveys$, { initialValue: null });
  readonly surveyAnswersMap = toSignal(this.facade.surveyAnswersMap$, { initialValue: {} as Record<string, ResponseCounts | null> });

  readonly draftSurveys = computed(() => this.surveys()?.results?.filter(s => !s.locked) ?? []);
  readonly currentSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && s.active) ?? []);
  readonly previousSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && !s.active) ?? []);

  readonly viewMode = signal<'cards' | 'table'>('cards');

  constructor() {
    this.modals.confirmAction$.pipe(takeUntilDestroyed()).subscribe(({ action, surveyId }) => {
      if (action === 'activate') this.facade.activateAndRefresh(surveyId);
      else this.facade.deactivateAndRefresh(surveyId);
    });

    this.modals.confirmReactivate$.pipe(takeUntilDestroyed()).subscribe(({ surveyId, closeDate }) => {
      this.facade.activateAndRefresh(surveyId, closeDate);
    });

    this.modals.confirmEditDates$.pipe(takeUntilDestroyed()).subscribe(({ survey, startDate, closeDate }) => {
      this.facade.updateDatesAndRefresh(survey, startDate, closeDate);
    });
  }

  ngOnInit(): void {
    (this.facade.coordinator$ as Observable<Coordinator>).pipe(
      filter(c => !!c?.type),
      take(1)
    ).subscribe(c => this.notifSettings.initialize(c.type));
  }

  openNotificationSettings(): void {
    const type = this.coordinator()?.type;
    if (type) this.notifSettings.open(type);
  }

  generateAnswers(surveyId: string): void {
    this.facade.generateAnswersAndRefresh(surveyId);
  }

  openConfirmModal(action: 'activate' | 'deactivate', surveyId: string): void {
    this.modals.openConfirmModal(action, surveyId);
  }

  openReactivateModal(surveyId: string): void {
    this.modals.openReactivateModal(surveyId);
  }

  openEditDatesModal(survey: Model): void {
    this.modals.openEditDatesModal(survey);
  }
}
