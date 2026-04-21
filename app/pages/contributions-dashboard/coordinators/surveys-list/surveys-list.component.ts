import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoordinatorSurveysFacade } from './coordinator-surveys.facade';
import { Model } from '../../../../../catalogue-ui/domain/dynamic-form-model';

declare var UIkit: any;

@Component({
    selector: 'app-survey-lists',
    templateUrl: 'surveys-list.component.html',
    standalone: false
})

export class SurveysListComponent {
  private facade = inject(CoordinatorSurveysFacade);

  readonly surveys = toSignal(this.facade.surveys$, {initialValue: null});
  readonly surveyAnswersMap = toSignal(this.facade.surveyAnswersMap$, {initialValue: {}});

  readonly draftSurveys = computed(() => this.surveys()?.results?.filter(s => !s.locked) ?? []);
  readonly currentSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && s.active) ?? []);
  readonly previousSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && !s.active) ?? []);

  selectedSurvey: Model | null = null;
  editStartDate: string | null = null;
  editCloseDate: string | null = null;

  generateAnswers(surveyId: string) {
    this.facade.generateAnswersAndRefresh(surveyId);
  }

  activateSurvey(surveyId: string) {
    this.facade.activateAndRefresh(surveyId);
  }

  openEditDatesModal(survey: Model) {
    this.selectedSurvey = survey;
    this.editStartDate = survey.submissionStartAt;
    this.editCloseDate = survey.submissionCloseAt;
    UIkit.modal('#editDatesModal').show();
  }

  confirmEditDates() {
    this.facade.updateDatesAndRefresh(this.selectedSurvey, this.editStartDate, this.editCloseDate);
    UIkit.modal('#editDatesModal').hide();
  }
}
