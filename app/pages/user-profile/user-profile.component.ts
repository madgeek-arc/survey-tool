import {Component, computed, OnDestroy, OnInit, signal} from "@angular/core";
import { Profile, UserInfo } from "../../domain/userInfo";
import { UserService } from "../../services/user.service";
import { CompressImageService } from "../../services/compress-image.service";
import { take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
    selector: 'app-profile',
    templateUrl: 'user-profile.component.html',
    styleUrls: ['user-profile.component.scss'],
    providers: [CompressImageService],
    standalone: false
})

export class UserProfileComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();

  userInfo: UserInfo = null;
  edit: boolean = false;
  image: File = null;
  activeTab: 'profile' | 'notifications' = 'profile';
  newForwardEmail: string = '';

  contactFormMessages = signal(false);
  surveyMentions = signal(false);
  surveyUpdates = signal(false);
  forwardEmails = signal<string[]>([]);

  constructor(private userService: UserService, private compressImage: CompressImageService) {}

  ngOnInit() {
    this.userService.getUserObservable().pipe(takeUntil(this._destroyed)).subscribe({
      next: value => {
        const isFirstLoad = !this.userInfo;
        this.userInfo = value;
        if (this.userInfo?.user.profile === null)
          this.userInfo.user.profile = new Profile();

        if (isFirstLoad) {
          const prefs = this.userInfo?.user?.settings?.notificationPreferences;
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
      this.image = event.files[0];

      this.compressImage.compress(this.image).pipe(take(1)).subscribe(
        compressedImage => {
          this.image = compressedImage;

          reader.readAsDataURL(this.image);
          reader.onload = () => {
            // this.imageSrc = reader.result as string;
            this.userInfo.user.profile.picture = (reader.result as string).split('base64,')[1];
          };
        }
      );
    }
  }

  updateProfile() {
    this.userService.updateProfile(this.userInfo.user.profile, this.userInfo.user.id).subscribe(
      res => {
        this.userInfo.user = res;
        this.userService.setUserInfo(this.userInfo);
        this.edit = false;
      }
    );
  }

  emailNotifications = signal(true);

  activeNotificationsCount = computed(() =>
    !this.emailNotifications() ? 0 : [this.contactFormMessages(), this.surveyMentions(), this.surveyUpdates()].filter(Boolean).length
  );



  addForwardEmail() {
    const email = this.newForwardEmail.trim();
    if (!email || this.forwardEmails().includes(email) || email === this.userInfo?.user?.email) {
      return;
    }
    this.forwardEmails.update(list => [...list, email]);
    this.newForwardEmail = '';
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
    }, this.userInfo.user.id)
    .pipe(take(1))
    .subscribe({
      next: updatedUser => {
        this.userInfo.user = updatedUser;
        this.userService.setUserInfo(this.userInfo);
      }
    });
  }

}
