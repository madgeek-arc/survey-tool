import {Component, computed, OnDestroy, OnInit, signal, ChangeDetectionStrategy, inject} from "@angular/core";
import { Profile, UserInfo } from "../../domain/userInfo";
import { UserService } from "../../services/user.service";
import { CompressImageService } from "../../services/compress-image.service";
import { take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { FormsModule } from "@angular/forms";
import { NgClass, UpperCasePipe } from "@angular/common";
import { SafeUrlPipe } from "../../../catalogue-ui/shared/pipes/safeUrlPipe";

@Component({
    selector: 'app-profile',
    templateUrl: 'user-profile.component.html',
    styleUrls: ['user-profile.component.scss'],
    providers: [CompressImageService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, NgClass, UpperCasePipe, SafeUrlPipe]
})

export class UserProfileComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();

  userInfo = signal<UserInfo | null>(null);
  edit = signal(false);
  image = signal<File | null>(null);
  activeTab = signal<'profile' | 'notifications'>('profile');
  newForwardEmail = signal('');

  contactFormMessages = signal(false);
  surveyMentions = signal(false);
  surveyUpdates = signal(false);
  forwardEmails = signal<string[]>([]);

  private userService = inject(UserService);
  private compressImage = inject(CompressImageService);

  ngOnInit() {
    this.userService.getUserObservable().pipe(takeUntil(this._destroyed)).subscribe({
      next: value => {
        const isFirstLoad = !this.userInfo();
        if (value?.user.profile === null)
          value.user.profile = new Profile();
        this.userInfo.set(value);

        if (isFirstLoad) {
          const prefs = value?.user?.settings?.notificationPreferences;
          if (prefs) {
            this.emailNotifications.set(prefs.emailNotifications ?? true);
            this.contactFormMessages.set(prefs.contactFormEmailNotifications ?? false);
            this.surveyMentions.set(prefs.mentionEmailNotifications ?? false);
            this.surveyUpdates.set(prefs.surveyEmailNotifications ?? false);
            this.forwardEmails.set(prefs.forwardEmails ?? []);
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  onFileSelect(e: Event) {
    let event = e.target as HTMLInputElement;
    const reader = new FileReader();
    if(event.files && event.files.length) {
      this.image.set(event.files[0]);

      this.compressImage.compress(this.image()).pipe(take(1)).subscribe(
        compressedImage => {
          this.image.set(compressedImage);

          reader.readAsDataURL(compressedImage);
          reader.onload = () => {
            // this.imageSrc = reader.result as string;
            // A new profile object, so the avatar re-renders; the inputs keep editing the new one.
            const picture = (reader.result as string).split('base64,')[1];
            this.userInfo.update(info => ({...info, user: {...info.user, profile: {...info.user.profile, picture}}}));
          };
        }
      );
    }
  }

  updateProfile() {
    this.userService.updateProfile(this.userInfo().user.profile, this.userInfo().user.id).subscribe(
      res => {
        this.userService.setUserInfo({...this.userInfo(), user: res});
        this.edit.set(false);
      }
    );
  }

  emailNotifications = signal(true);

  activeNotificationsCount = computed(() =>
    !this.emailNotifications() ? 0 : [this.contactFormMessages(), this.surveyMentions(), this.surveyUpdates()].filter(Boolean).length
  );



  addForwardEmail() {
    const email = this.newForwardEmail().trim();
    if (!email || this.forwardEmails().includes(email) || email === this.userInfo()?.user?.email) {
      return;
    }
    this.forwardEmails.update(list => [...list, email]);
    this.newForwardEmail.set('');
    this.saveNotificationPreferences();
  }

  removeForwardEmail(email: string) {
    this.forwardEmails.update(list => list.filter(e => e !== email));
    this.saveNotificationPreferences();
  }

  saveNotificationPreferences() {
    this.userService.updateSettings({
      notificationPreferences: {
        emailNotifications: this.emailNotifications(),
        contactFormEmailNotifications: this.contactFormMessages(),
        mentionEmailNotifications: this.surveyMentions(),
        surveyEmailNotifications: this.surveyUpdates(),
        forwardEmails: this.forwardEmails()
      }
    }, this.userInfo().user.id)
    .pipe(take(1))
    .subscribe({
      next: updatedUser => {
        this.userService.setUserInfo({...this.userInfo(), user: updatedUser});
      }
    });
  }

}
