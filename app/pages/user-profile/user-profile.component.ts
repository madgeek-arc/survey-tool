import { Component, OnDestroy, OnInit } from "@angular/core";
import { Profile, UserInfo } from "../../domain/userInfo";
import { UserService } from "../../services/user.service";
import { CompressImageService } from "../../services/compress-image.service";
import { take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
  selector: 'app-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.scss'],
  providers: [CompressImageService]
})

export class UserProfileComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();

  userInfo: UserInfo = null;
  edit: boolean = false;
  image: File = null;

  constructor(private userService: UserService, private compressImage: CompressImageService) {}

  ngOnInit() {
    this.userService.getUserObservable().pipe(takeUntil(this._destroyed)).subscribe({
      next: value => {
        this.userInfo = value;
        if (this.userInfo?.user.profile === null)
          this.userInfo.user.profile = new Profile();
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

}
