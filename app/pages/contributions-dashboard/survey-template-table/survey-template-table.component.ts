import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Model } from '../../../../catalogue-ui/domain/dynamic-form-model';
import { SurveyCategory, ResponseCounts } from '../survey-template-card/survey-template-card.component';
import { getStatusBadge, getDaysLeft, getResponsePercent } from '../survey-template-card/survey-card.utils';

@Component({
  selector: 'app-survey-template-table',
  templateUrl: './survey-template-table.component.html',
  styleUrl: './survey-template-table.component.css',
  standalone: true,
  imports: [RouterLink, DatePipe]
})
export class SurveyTemplateTableComponent {
  readonly surveys = input.required<Model[]>();
  readonly category = input.required<SurveyCategory>();
  readonly responsesMap = input<Record<string, ResponseCounts | null | undefined>>({});

  readonly activate = output<string>();
  readonly deactivate = output<string>();
  readonly generate = output<string>();
  readonly editDates = output<Model>();
  readonly openNotifications = output<void>();

  readonly getStatusBadge = getStatusBadge;
  readonly getDaysLeft = getDaysLeft;
  readonly getResponsePercent = getResponsePercent;

  showGenerate(surveyId: string): boolean {
    return this.responsesMap()[surveyId]?.total === 0;
  }
}
