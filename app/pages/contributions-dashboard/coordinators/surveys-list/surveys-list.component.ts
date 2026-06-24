import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoordinatorSurveysFacade, ResponseCounts } from './coordinator-surveys.facade';
import { NotificationSettingsService } from '../../../../services/notification-settings.service';
import { Model } from '../../../../../catalogue-ui/domain/dynamic-form-model';
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Coordinator } from '../../../../domain/userInfo';

declare var UIkit: any;

@Component({
    selector: 'app-survey-lists',
    templateUrl: 'surveys-list.component.html',
    standalone: false
})

export class SurveysListComponent implements OnInit {
  private facade = inject(CoordinatorSurveysFacade);
  protected readonly notifSettings = inject(NotificationSettingsService);

  private readonly coordinator = toSignal(this.facade.coordinator$, {initialValue: null});
  readonly surveys = toSignal(this.facade.surveys$, {initialValue: null});
  readonly surveyAnswersMap = toSignal(this.facade.surveyAnswersMap$, {initialValue: {} as Record<string, ResponseCounts | null>});

  readonly draftSurveys = computed(() => this.surveys()?.results?.filter(s => !s.locked) ?? []);
  readonly currentSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && s.active) ?? []);
  readonly previousSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && !s.active) ?? []);

  readonly viewMode = signal<'cards' | 'table'>('cards');

  selectedSurvey: Model | null = null;
  editStartDate: string | null = null;
  editCloseDate: string | null = null;

  pendingAction: 'activate' | 'deactivate' | null = null;
  pendingSurveyId: string | null = null;

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

  generateAnswers(surveyId: string) {
    this.facade.generateAnswersAndRefresh(surveyId);
  }

  openConfirmModal(action: 'activate' | 'deactivate', surveyId: string) {
    this.pendingAction = action;
    this.pendingSurveyId = surveyId;
    UIkit.modal('#confirmActionModal').show();
  }

  confirmAction() {
    if (this.pendingAction === 'activate') {
      this.facade.activateAndRefresh(this.pendingSurveyId!);
    } else {
      this.facade.deactivateAndRefresh(this.pendingSurveyId!);
    }
    UIkit.modal('#confirmActionModal').hide();
  }

  openEditDatesModal(survey: Model) {
    this.selectedSurvey = survey;
    this.editStartDate = survey.submissionStartAt?.slice(0, 10) ?? null;
    this.editCloseDate = survey.submissionCloseAt?.slice(0, 10) ?? null;
    UIkit.modal('#editDatesModal').show();
  }

  confirmEditDates() {
    this.facade.updateDatesAndRefresh(this.selectedSurvey, this.editStartDate, this.editCloseDate);
    UIkit.modal('#editDatesModal').hide();
  }
}
