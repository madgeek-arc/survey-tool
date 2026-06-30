import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminSurveysFacade, ResponseCounts } from './admin-surveys.facade';
import { NotificationSettingsService } from '../../../../services/notification-settings.service';
import { SurveyModalsService } from '../../../../services/survey-modals.service';
import { Model } from '../../../../../catalogue-ui/domain/dynamic-form-model';
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Administrator } from '../../../../domain/userInfo';
import { SurveyToolModule } from '../../../../survey-tool.module';
import { SidebarMobileToggleComponent } from '../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';
import { PageContentComponent } from '../../../../shared/page-content/page-content.component';
import { FormsModule } from '@angular/forms';
import { SurveyTemplateCardComponent } from '../../survey-template-card/survey-template-card.component';
import { SurveyTemplateTableComponent } from '../../survey-template-table/survey-template-table.component';
import { NotificationSettingsDrawerComponent } from '../../notification-settings-drawer/notification-settings-drawer.component';
import { SurveyModalsComponent } from '../../survey-modals/survey-modals.component';

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
    NotificationSettingsDrawerComponent,
    SurveyModalsComponent
  ]
})
export class AdminSurveysListComponent implements OnInit {
  private readonly facade = inject(AdminSurveysFacade);
  protected readonly notifSettings = inject(NotificationSettingsService);
  protected readonly modals = inject(SurveyModalsService);

  readonly administrator = toSignal(this.facade.administrator$, { initialValue: null });
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
    (this.facade.administrator$ as Observable<Administrator>).pipe(
      filter(c => !!c?.type),
      take(1)
    ).subscribe(c => this.notifSettings.initialize(c.type));
  }

  openNotificationSettings(): void {
    const type = this.administrator()?.type;
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
