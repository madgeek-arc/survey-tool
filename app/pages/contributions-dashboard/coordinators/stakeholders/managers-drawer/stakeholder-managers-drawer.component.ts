import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GroupMembers, Stakeholder, User } from '../../../../../domain/userInfo';
import { StakeholdersService } from '../../../../../services/stakeholders.service';
import { SurveyService } from '../../../../../services/survey.service';

declare var UIkit: any;

export const STAKEHOLDER_MANAGERS_DRAWER_ID = 'stakeholderManagersOffcanvas';

type AddMode = 'existing' | 'invite';

@Component({
  selector: 'app-stakeholder-managers-drawer',
  templateUrl: './stakeholder-managers-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  providers: [SurveyService]
})
export class StakeholderManagersDrawerComponent {
  private readonly stakeholdersService = inject(StakeholdersService);
  private readonly surveyService = inject(SurveyService);
  private readonly destroyRef = inject(DestroyRef);

  readonly stakeholder = input<Stakeholder | null>(null);
  /** Emitted after managers change, so the list can refresh its counts. */
  readonly changed = output<void>();

  readonly drawerId = STAKEHOLDER_MANAGERS_DRAWER_ID;

  readonly members = signal<GroupMembers | null>(null);
  readonly loading = signal(false);

  // Add manager form
  readonly addOpen = signal(false);
  readonly addMode = signal<AddMode>('existing');
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly email = new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]});

  // Invitation result
  readonly invitationLink = signal<string | null>(null);
  readonly invitationEmailSent = signal(false);
  readonly copied = signal(false);

  // Remove confirmation
  readonly confirmRemove = signal<string | null>(null);

  constructor() {
    effect(() => {
      const stakeholder = this.stakeholder();
      this.resetState();
      this.members.set(null);
      if (stakeholder?.id)
        this.loadMembers(stakeholder.id);
    });
  }

  initials(user: User): string {
    const name = user.fullname || user.email || '';
    return name.split(/[\s@._]+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }

  close() {
    UIkit.offcanvas('#' + this.drawerId).hide();
    this.resetState();
  }

  openAdd() {
    this.addOpen.set(true);
    this.addMode.set('existing');
    this.email.reset();
    this.errorMessage.set(null);
    this.invitationLink.set(null);
  }

  closeAdd() {
    this.addOpen.set(false);
    this.email.reset();
    this.errorMessage.set(null);
  }

  setMode(mode: AddMode) {
    this.addMode.set(mode);
    this.errorMessage.set(null);
  }

  submit() {
    const stakeholder = this.stakeholder();
    if (!stakeholder)
      return;
    if (this.email.invalid) {
      this.email.markAsTouched();
      this.errorMessage.set('Enter a valid email address.');
      return;
    }
    const email = this.email.value.trim();
    if (this.isMember(email)) {
      this.errorMessage.set('This person is already in the group.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    if (this.addMode() === 'existing') {
      this.run(this.surveyService.addManagerToStakeholder(stakeholder.id, email), () => {
        this.closeAdd();
        this.notify(email + ' added as manager');
      });
    } else {
      this.run(this.surveyService.getInvitationToken(email, 'manager', stakeholder.id), res => {
        this.invitationLink.set(location.origin + '/invitation/accept/' + res.token);
        this.invitationEmailSent.set(res.emailSent);
        this.copied.set(false);
        this.closeAdd();
        this.notify('Invitation created for ' + email);
      });
    }
  }

  removeManager(email: string) {
    const stakeholder = this.stakeholder();
    if (!stakeholder)
      return;
    this.submitting.set(true);
    this.run(this.surveyService.removeManager(stakeholder.id, email), () => {
      this.confirmRemove.set(null);
      this.notify(email + ' removed from managers');
    });
  }

  copyInvitationLink() {
    const link = this.invitationLink();
    // navigator.clipboard needs a secure context (https); on plain http it is undefined and the link must be copied by hand
    if (!link || !navigator.clipboard)
      return;
    navigator.clipboard.writeText(link).then(() => this.copied.set(true)).catch(err => console.error(err));
  }

  private run<T>(request: Observable<T>, onSuccess: (res: T) => void) {
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.submitting.set(false);
        onSuccess(res);
        this.loadMembers(this.stakeholder()!.id);
        this.changed.emit();
      },
      error: err => {
        console.error(err);
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.error ?? err?.message ?? 'Something went wrong. Please try again.');
      }
    });
  }

  private loadMembers(id: string) {
    this.loading.set(true);
    this.stakeholdersService.getStakeholderMembers(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: members => {
        this.members.set(members);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  private isMember(email: string): boolean {
    const members = this.members();
    const all = [...(members?.admins ?? []), ...(members?.members ?? [])];
    return all.some(user => user.email?.toLowerCase() === email.toLowerCase());
  }

  private notify(message: string) {
    UIkit.notification({message, status: 'success', pos: 'bottom-center', timeout: 2800});
  }

  private resetState() {
    this.addOpen.set(false);
    this.email.reset();
    this.errorMessage.set(null);
    this.invitationLink.set(null);
    this.confirmRemove.set(null);
    this.submitting.set(false);
  }
}
