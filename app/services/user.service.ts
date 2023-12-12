import {Injectable, OnDestroy} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Coordinator, Profile, Stakeholder, GroupMembers, User, UserInfo} from "../domain/userInfo";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Injectable()
export class UserService implements OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();

  options = {withCredentials: true};
  base = environment.API_ENDPOINT;

  userId = null;
  // userInfo = new BehaviorSubject<UserInfo>(null);
  currentStakeholder = new BehaviorSubject<Stakeholder>(null);
  currentCoordinator = new BehaviorSubject<Coordinator>(null);
  private userInfoChangeSubject = new BehaviorSubject<UserInfo>(null);
  private currentUserInfo: UserInfo = null;

  constructor(public http: HttpClient) {}


  changeCurrentStakeholder(currentGroup: Stakeholder) {
    this.currentStakeholder.next(currentGroup);
    // console.log(this.currentStakeholder);
    sessionStorage.setItem('currentStakeholder', JSON.stringify(currentGroup));
    sessionStorage.removeItem('currentCoordinator');
    this.currentCoordinator.next(null);
  }

  changeCurrentCoordinator(currentCoordinator: Coordinator) {
    this.currentCoordinator.next(currentCoordinator);
    // console.log(this.currentCoordinator);
    sessionStorage.setItem('currentCoordinator', JSON.stringify(currentCoordinator));
    sessionStorage.removeItem('currentStakeholder');
    this.currentStakeholder.next(null);
  }

  getUserInfo() {
    return this.http.get<UserInfo>(this.base + '/user/info');
  }

  getUserObservable() {
    if (!this.currentUserInfo) {
      this.getUserInfo().pipe(takeUntil(this._destroyed)).subscribe({
        next: value => this.setUserInfo(value),
        error: err => {
          console.error(err);
          this.clearUserInfo();
        },
      });
    }

    return this.userInfoChangeSubject.asObservable();
  }

  getCurrentUserInfo() {
    return this.currentUserInfo;
  }

  setUserInfo(userInfo: UserInfo){
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    this.currentUserInfo = userInfo;
    this.userInfoChangeSubject.next(userInfo);
  }

  clearUserInfo() {
    this.currentUserInfo = null;
    this.userInfoChangeSubject.next(null);
    this.userInfoChangeSubject.complete();
  }

  setUserConsent(id: string) {
    return this.http.patch(this.base + `/user/policies/${id}`, null);
  }

  getStakeholdersMembers(id: string) {
    return this.http.get<GroupMembers>(this.base + `/stakeholders/${id}/members`, this.options);
  }

  updateProfile(profile: Profile, id: string) {
    return this.http.put<User>(this.base + `/users/${id}/profile`, profile);
  }

  updateProfilePicture(picture: string | ArrayBuffer, id: string) {
    return this.http.post(this.base + `/users/${id}/profile/picture`, {picture});
  }


  ngOnDestroy(): void {
    this.clearUserInfo();
    this.currentStakeholder.next(null);
    this.currentStakeholder.complete();
    this.currentCoordinator.next(null);
    this.currentCoordinator.complete();
    this._destroyed.next(true);
    this._destroyed.complete();
  }
}
