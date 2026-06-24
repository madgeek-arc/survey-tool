import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogueUiReusableComponentsModule } from '../../../../catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import { Model } from '../../../../catalogue-ui/domain/dynamic-form-model';
import { getStatusBadge, getDaysLeft, getResponsePercent } from './survey-card.utils';

export type SurveyCategory = 'draft' | 'current' | 'previous';
export type ResponseCounts = { responded: number; total: number };

@Component({
  selector: 'app-survey-template-card',
  templateUrl: './survey-template-card.component.html',
  styleUrl: './survey-template-card.component.css',
  standalone: true,
  imports: [RouterLink, DatePipe, CatalogueUiReusableComponentsModule]
})
export class SurveyTemplateCardComponent {
  readonly survey = input.required<Model>();
  readonly category = input.required<SurveyCategory>();
  /** undefined = still loading; null = API error; object = loaded */
  readonly responses = input<ResponseCounts | null | undefined>(undefined);
  readonly notificationsCount = input<number | null>(null);

  readonly activate = output<string>();
  readonly deactivate = output<string>();
  readonly generate = output<string>();
  readonly editDates = output<Model>();
  readonly openNotifications = output<void>();

  readonly statusBadge = computed(() => getStatusBadge(this.survey()));
  readonly daysLeft = computed(() => getDaysLeft(this.survey()));
  readonly responsePercent = computed(() => getResponsePercent(this.responses()));

  /** Show Generate only when answer records have NOT been created yet (total === 0) */
  readonly showGenerate = computed(() => this.responses()?.total === 0);
}
