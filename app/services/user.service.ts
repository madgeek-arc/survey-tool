import {Injectable, OnDestroy} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Coordinator, Profile, Stakeholder, GroupMembers, User, UserInfo, Administrator} from "../domain/userInfo";
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
  currentAdministrator = new BehaviorSubject<Administrator>(null);
  private userInfoChangeSubject = new BehaviorSubject<UserInfo>(null);
  private currentUserInfo: UserInfo = null;
  private intervalId = null;

  constructor(public http: HttpClient) {
    this.intervalId = setInterval(() => {
      this.updateUserInfo();
    }, 60 * 60 * 1000);
  }


  changeCurrentStakeholder(currentGroup: Stakeholder) {
    this.currentStakeholder.next(currentGroup);
    // console.log(this.currentStakeholder);
    sessionStorage.setItem('currentStakeholder', JSON.stringify(currentGroup));
    sessionStorage.removeItem('currentCoordinator');
    sessionStorage.removeItem('currentAdministrator');
    this.currentCoordinator.next(null);
    this.currentAdministrator.next(null);
  }

  changeCurrentCoordinator(currentCoordinator: Coordinator) {
    this.currentCoordinator.next(currentCoordinator);
    // console.log(this.currentCoordinator);
    sessionStorage.setItem('currentCoordinator', JSON.stringify(currentCoordinator));
    sessionStorage.removeItem('currentStakeholder');
    sessionStorage.removeItem('currentAdministrator');
    this.currentStakeholder.next(null);
    this.currentAdministrator.next(null);
  }

  changeCurrentAdministrator(current: Administrator) {
    this.currentAdministrator.next(current);
    // console.log(this.currentAdministrator);
    sessionStorage.setItem('currentAdministrator', JSON.stringify(current));
    sessionStorage.removeItem('currentStakeholder');
    sessionStorage.removeItem('currentCoordinator');
    this.currentStakeholder.next(null);
    this.currentCoordinator.next(null);
  }

  getUserInfo() {
    return this.http.get<UserInfo>(this.base + '/user/info');
  }

  updateUserInfo() {
    this.getUserInfo().pipe(takeUntil(this._destroyed)).subscribe({
      next: value => this.setUserInfo(value),
      error: err => {
        console.error(err);
        this.clearUserInfo();
      },
    });
  }

  getUserObservable() {
    if (!this.currentUserInfo) {
      this.updateUserInfo();
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
    sessionStorage.removeItem('userInfo');
    this.userInfoChangeSubject.complete();
  }

  setUserConsent(id: string) {
    return this.http.patch(this.base + `/user/policies/${id}`, null);
  }

  getStakeholdersMembers(id: string) {
    return this.http.get<GroupMembers>(this.base + `/stakeholders/${id}/users`, this.options);
  }

  updateProfile(profile: Profile, id: string) {
    return this.http.put<User>(this.base + `/users/${id}/profile`, profile);
  }

  updateProfilePicture(picture: string | ArrayBuffer, id: string) {
    return this.http.post(this.base + `/users/${id}/profile/picture`, {picture});
  }


  ngOnDestroy(): void {
    this.clearUserInfo();
    clearInterval(this.intervalId);
    this.currentStakeholder.next(null);
    this.currentStakeholder.complete();
    this.currentCoordinator.next(null);
    this.currentCoordinator.complete();
    this._destroyed.next(true);
    this._destroyed.complete();
  }
}
