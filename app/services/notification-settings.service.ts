import { Injectable, computed, inject, signal } from '@angular/core';
import { SurveyService } from './survey.service';
import { SurveyNotifications } from '../domain/survey';
import { tap } from 'rxjs/operators';

declare var UIkit: any;

@Injectable({ providedIn: 'root' })
export class NotificationSettingsService {
  private readonly surveyService = inject(SurveyService);

  private _surveyType: string | null = null;
  private readonly _snapshot = signal<SurveyNotifications | null>(null);

  readonly draftNotifyOnStart= signal(false);
  readonly draftNotifyOnEnd= signal(false);
  readonly draftNotifyOnDeadlineChange= signal(false);
  readonly draftNotifyOnDeadlineApproaching= signal(false);
  readonly draftNotifyOnDeadlineDay= signal(false);
  readonly draftNotifyOnReopened= signal(false);
  readonly draftDeadlineApproachingDays= signal(0);

  // Derived — reads from the committed snapshot, not the live draft signals
  readonly activeNotificationsCount = computed(() => {
    const s = this._snapshot();
    if (!s) return 0;
    return [
      s.notifyOnStart,
      s.notifyOnEnd,
      s.notifyOnDeadlineChange,
      s.notifyOnDeadlineApproaching,
      s.notifyOnDeadlineDay,
      s.notifyOnReopened
    ].filter(Boolean).length;
  });

  readonly showDaysStepper = computed(() => this.draftNotifyOnDeadlineApproaching());

  // Drawer lifecycle

  initialize(surveyType: string): void {
    this._surveyType = surveyType;
    this._snapshot.set(null);

    this.surveyService.getNotificationSettings(surveyType).subscribe({
      next: data => this._applySettings(data),
      error: () => this._applySettings({
        id: null,
        surveyType,
        notifyOnStart: false,
        notifyOnEnd: false,
        notifyOnDeadlineChange: false,
        notifyOnDeadlineApproaching: false,
        notifyOnDeadlineDay: false,
        notifyOnReopened: false,
        deadlineApproachingDays: 1
      })
    });
  }

  open(surveyType: string): void {
    this.initialize(surveyType);
    UIkit.offcanvas('#notificationSettingsOffcanvas').show();
  }

  save(): void {
    const payload: SurveyNotifications = {
      id: this._snapshot()?.id ?? null,
      surveyType: this._surveyType,
      notifyOnStart: this.draftNotifyOnStart(),
      notifyOnEnd: this.draftNotifyOnEnd(),
      notifyOnDeadlineChange: this.draftNotifyOnDeadlineChange(),
      notifyOnDeadlineApproaching: this.draftNotifyOnDeadlineApproaching(),
      notifyOnDeadlineDay: this.draftNotifyOnDeadlineDay(),
      notifyOnReopened: this.draftNotifyOnReopened(),
      deadlineApproachingDays: this.draftDeadlineApproachingDays()
    };

    this.surveyService.upsertNotificationSettings(this._surveyType, payload).pipe(
      tap(saved => {
        this._surveyType = saved.surveyType;
        this._snapshot.set(saved);
      })
    ).subscribe({
      error: err => console.error('Failed to save notification settings', err)
    });

    UIkit.offcanvas('#notificationSettingsOffcanvas').hide();
  }

  cancel(): void {
    const s = this._snapshot();
    if (s) this._applySettings(s);
    UIkit.offcanvas('#notificationSettingsOffcanvas').hide();
  }

  // Stepper helpers

  decrementDays(): void {
    this.draftDeadlineApproachingDays.update(d => Math.max(1, d - 1));
  }

  incrementDays(): void {
    this.draftDeadlineApproachingDays.update(d => d + 1);
  }

  private _applySettings(data: SurveyNotifications): void {
    this._snapshot.set(data);
    this.draftNotifyOnStart.set(data.notifyOnStart ?? false);
    this.draftNotifyOnEnd.set(data.notifyOnEnd ?? false);
    this.draftNotifyOnDeadlineChange.set(data.notifyOnDeadlineChange ?? false);
    this.draftNotifyOnDeadlineApproaching.set(data.notifyOnDeadlineApproaching ?? false);
    this.draftNotifyOnDeadlineDay.set(data.notifyOnDeadlineDay ?? false);
    this.draftNotifyOnReopened.set(data.notifyOnReopened ?? false);
    this.draftDeadlineApproachingDays.set(data.deadlineApproachingDays ?? 1);
  }
}
