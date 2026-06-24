import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { AdminSurveysFacade, ResponseCounts } from "./admin-surveys.facade";
import { NotificationSettingsService } from '../../../../services/notification-settings.service';
import { Model } from "../../../../../catalogue-ui/domain/dynamic-form-model";
declare var UIkit: any;
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Administrator } from '../../../../domain/userInfo';
import { SurveyToolModule } from "../../../../survey-tool.module";
import {
  SidebarMobileToggleComponent
} from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "../../../../shared/page-content/page-content.component";
import { FormsModule } from "@angular/forms";
import { SurveyTemplateCardComponent } from "../../survey-template-card/survey-template-card.component";
import { SurveyTemplateTableComponent } from "../../survey-template-table/survey-template-table.component";
import { NotificationSettingsDrawerComponent } from "../../notification-settings-drawer/notification-settings-drawer.component";

@Component({
  selector: 'app-admin-surveys-list',
  templateUrl: 'admin-surveys-list.component.html',
  standalone: true,
  imports: [
    SurveyToolModule,
    SidebarMobileToggleComponent,
    PageContentComponent,
    FormsModule,
    SurveyTemplateCardComponent,
    SurveyTemplateTableComponent,
    NotificationSettingsDrawerComponent
  ]
})
export class AdminSurveysListComponent implements OnInit {
  private facade = inject(AdminSurveysFacade);
  protected readonly notifSettings = inject(NotificationSettingsService);

  readonly administrator = toSignal(this.facade.administrator$, {initialValue: null});
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
    (this.facade.administrator$ as Observable<Administrator>).pipe(
      filter(c => !!c?.type),
      take(1)
    ).subscribe(c => this.notifSettings.initialize(c.type));
  }

  openNotificationSettings(): void {
    const type = this.administrator()?.type;
    if (type) this.notifSettings.open(type);
  }

  generateAnswers(surveyId: string) {
    this.facade.generateAnswersAndRefresh(surveyId);
  }

  openConfirmModal(action: 'activate' | 'deactivate', surveyId: string) {
    this.pendingAction = action;
    this.pendingSurveyId = surveyId;
    UIkit.modal('#adminConfirmActionModal').show();
  }

  confirmAction() {
    if (this.pendingAction === 'activate') {
      this.facade.activateAndRefresh(this.pendingSurveyId!);
    } else {
      this.facade.deactivateAndRefresh(this.pendingSurveyId!);
    }
    UIkit.modal('#adminConfirmActionModal').hide();
  }

  openEditDatesModal(survey: Model) {
    this.selectedSurvey = survey;
    this.editStartDate = survey.submissionStartAt?.slice(0, 10) ?? null;
    this.editCloseDate = survey.submissionCloseAt?.slice(0, 10) ?? null;
    UIkit.modal('#adminEditDatesModal').show();
  }

  confirmEditDates() {
    this.facade.updateDatesAndRefresh(this.selectedSurvey, this.editStartDate, this.editCloseDate);
    UIkit.modal('#adminEditDatesModal').hide();
  }
}
