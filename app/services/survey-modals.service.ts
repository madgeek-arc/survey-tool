import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Model } from '../../catalogue-ui/domain/dynamic-form-model';

declare var UIkit: any;

export interface ConfirmActionEvent {
  action: 'activate' | 'deactivate';
  surveyId: string;
}

export interface ConfirmReactivateEvent {
  surveyId: string;
  closeDate: string | null;
}

export interface ConfirmEditDatesEvent {
  survey: Model;
  startDate: string | null;
  closeDate: string | null;
}

@Injectable({ providedIn: 'root' })
export class SurveyModalsService {

  // Confirm action modal state
  readonly pendingAction = signal<'activate' | 'deactivate' | null>(null);
  private _pendingSurveyId = signal<string | null>(null);

  // Reactivate modal state
  private _pendingActivateSurveyId = signal<string | null>(null);
  readonly activateCloseDate = signal<string | null>(null);

  // Edit dates modal state
  private _selectedSurvey = signal<Model | null>(null);
  readonly editStartDate = signal<string | null>(null);
  readonly editCloseDate = signal<string | null>(null);

  // Confirmation streams — parents subscribe and call their own facade
  private readonly _confirmAction$ = new Subject<ConfirmActionEvent>();
  private readonly _confirmReactivate$ = new Subject<ConfirmReactivateEvent>();
  private readonly _confirmEditDates$ = new Subject<ConfirmEditDatesEvent>();

  readonly confirmAction$ = this._confirmAction$.asObservable();
  readonly confirmReactivate$ = this._confirmReactivate$.asObservable();
  readonly confirmEditDates$ = this._confirmEditDates$.asObservable();

  openConfirmModal(action: 'activate' | 'deactivate', surveyId: string): void {
    this.pendingAction.set(action);
    this._pendingSurveyId.set(surveyId);
    UIkit.modal('#surveyConfirmModal').show();
  }

  confirm(): void {
    this._confirmAction$.next({ action: this.pendingAction()!, surveyId: this._pendingSurveyId()! });
    UIkit.modal('#surveyConfirmModal').hide();
  }

  openReactivateModal(surveyId: string): void {
    this._pendingActivateSurveyId.set(surveyId);
    this.activateCloseDate.set(null);
    UIkit.modal('#surveyReactivateModal').show();
  }

  confirmReactivate(): void {
    this._confirmReactivate$.next({ surveyId: this._pendingActivateSurveyId()!, closeDate: this.activateCloseDate() });
    UIkit.modal('#surveyReactivateModal').hide();
  }

  openEditDatesModal(survey: Model): void {
    this._selectedSurvey.set(survey);
    this.editStartDate.set(survey.submissionStartAt?.slice(0, 10) ?? null);
    this.editCloseDate.set(survey.submissionCloseAt?.slice(0, 10) ?? null);
    UIkit.modal('#surveyEditDatesModal').show();
  }

  confirmEditDates(): void {
    this._confirmEditDates$.next({ survey: this._selectedSurvey()!, startDate: this.editStartDate(), closeDate: this.editCloseDate() });
    UIkit.modal('#surveyEditDatesModal').hide();
  }
}
