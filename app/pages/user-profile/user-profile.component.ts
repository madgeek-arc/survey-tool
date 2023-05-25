import {Component, OnInit} from "@angular/core";
import {UserInfo} from "../../domain/userInfo";

@Component({
  selector: 'app-profile',
  templateUrl: 'user-profile.component.html'
})

export class UserProfileComponent implements OnInit {

  userInfo: UserInfo = null;
  edit: boolean = false;
  image: File = null;
  imageSrc: string = null;

  ngOnInit() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  }

  onFileSelect(event) {
    const reader = new FileReader();
    if(event.target.files && event.target.files.length) {
      this.image = event.target.files[0];
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageSrc = reader.result as string;
        // this.myForm.patchValue({
        //   fileSource: reader.result
        // });
        this.userInfo.user.profile.picture = reader.result;
        console.log(this.userInfo.user.profile.picture);
      };
    }
  }

}
