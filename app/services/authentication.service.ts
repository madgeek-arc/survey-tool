import {Injectable} from "@angular/core";
import {deleteCookie, getCookie} from "../../catalogue-ui/shared/reusable-components/cookie-management";
import {environment} from "../../../environments/environment";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {UserService} from "./user.service";


@Injectable()
export class AuthenticationService {

  base = environment.API_ENDPOINT;
  loginRoute = environment.API_LOGIN;
  cookieName = 'AccessToken';

  constructor(private router: Router, private http: HttpClient, private userService: UserService) {
    // setInterval( ()=> {
    //   this.http.head(this.base + '/refreshLogin', {withCredentials: true}).subscribe(
    //     suc => {console.log('Refreshed login ' + suc)},
    //     error => {console.error(error)}
    //   );
    // }, 1000 * 60 * 10);
  }

  tryLogin() {
    if (getCookie(this.cookieName) === null) {
      console.log('Didn\'t find cookie, user is not logged in.' )
      sessionStorage.setItem('redirectUrl', window.location.pathname);
      this.login();
    } else {
      console.log('found cookie, user is logged in');
    }
  }

  login() {
    window.location.href = this.loginRoute;
  }

  logout() {
    sessionStorage.clear();
    deleteCookie(this.cookieName);
    this.userService.clearUserInfo();
    window.location.href = this.base + '/logout';
  }

  get authenticated(): boolean {
    return this.userService.getCurrentUserInfo() !== null;
  }

  redirect() {
    if (sessionStorage.getItem('redirectUrl') !== null) {
      let url = sessionStorage.getItem('redirectUrl');
      sessionStorage.removeItem('redirectUrl');
      this.router.navigate([url]);
    }
    return;
  }

}
