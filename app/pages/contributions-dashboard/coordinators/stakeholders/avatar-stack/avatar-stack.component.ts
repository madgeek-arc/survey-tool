import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

/** Overlapping initials circles for a list of emails: up to `max` circles, or `max - 1` plus a "+N" circle. */
@Component({
  selector: 'app-avatar-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'eos-avatar-stack'},
  template: `
    @for (avatar of stack().visible; track avatar.email) {
      <span class="uk-label uk-label-code uk-label-avatar" [title]="avatar.email">{{ avatar.initials }}</span>
    }
    @if (stack().more) {
      <span class="uk-label uk-label-code uk-label-avatar" [title]="stack().moreTitle">+{{ stack().more }}</span>
    }
  `,
})
export class AvatarStackComponent {
  readonly emails = input<string[] | null | undefined>([]);
  readonly max = input(3);

  protected readonly stack = computed(() => {
    const emails = (this.emails() ?? []).filter(Boolean);
    const shown = emails.length > this.max() ? emails.slice(0, this.max() - 1) : emails;
    const rest = emails.slice(shown.length);
    return {
      visible: shown.map(email => ({email, initials: initialsFromEmail(email)})),
      more: rest.length,
      moreTitle: rest.join(', '),
    };
  });
}

/** "john.doe@example.org" → "JD", "john@example.org" → "J". */
export function initialsFromEmail(email: string): string {
  const parts = email.split('@')[0].split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0]?.[0] ?? '?');
  return letters.toUpperCase();
}
