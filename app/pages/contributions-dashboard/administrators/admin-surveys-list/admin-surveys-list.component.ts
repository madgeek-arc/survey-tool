import { Component, computed, inject } from '@angular/core';
import { DatePipe } from "@angular/common";
import { RouterLink } from '@angular/router';
import { toSignal } from "@angular/core/rxjs-interop";
import { AdminSurveysFacade } from "./admin-surveys.facade";

import { SurveyToolModule } from "../../../../survey-tool.module";
import {
  SidebarMobileToggleComponent
} from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "../../../../shared/page-content/page-content.component";


@Component({
  selector: 'app-admin-surveys-list',
  templateUrl: 'admin-surveys-list.component.html',
  imports: [
    RouterLink,
    SurveyToolModule,
    DatePipe,
    SidebarMobileToggleComponent,
    PageContentComponent
  ]
})

export class AdminSurveysListComponent {
  private facade = inject(AdminSurveysFacade);

  /** convert observables to signals for easy template consumption */
  readonly administrator = toSignal(this.facade.administrator$, {initialValue: null});
  readonly surveys = toSignal(this.facade.surveys$, {initialValue: null});
  readonly surveyAnswersMap = toSignal(this.facade.surveyAnswersMap$, {initialValue: {}});

  /** computed lists (signals) */
  readonly draftSurveys = computed(() => this.surveys()?.results?.filter(s => !s.locked) ?? []);
  readonly currentSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && s.active) ?? []);
  readonly previousSurveys = computed(() => this.surveys()?.results?.filter(s => s.locked && !s.active) ?? []);

  generateAnswers(surveyId: string) {
    this.facade.generateAnswersAndRefresh(surveyId);
  }

}
