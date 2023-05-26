import {Component, OnInit} from "@angular/core";
import {UserInfo} from "../../domain/userInfo";
import {UserService} from "../../services/user.service";
import {CompressImageService} from "../../services/compress-image.service";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.scss'],
  providers: [CompressImageService]
})

export class UserProfileComponent implements OnInit {

  userInfo: UserInfo = null;
  edit: boolean = false;
  image: File = null;

  constructor(private userService: UserService, private compressImage: CompressImageService) {}

  ngOnInit() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  }

  onFileSelect(event) {
    const reader = new FileReader();
    if(event.target.files && event.target.files.length) {
      this.image = event.target.files[0];

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
        this.userService.setUserInfo(res);
        this.edit = false;
      }
    );
  }

}
