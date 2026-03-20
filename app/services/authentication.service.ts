import {inject, Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {Router} from "@angular/router";
import {HttpClient, HttpXsrfTokenExtractor} from "@angular/common/http";
import {UserService} from "./user.service";


@Injectable()
export class AuthenticationService {

  base = environment.API_ENDPOINT;
  loginRoute = environment.API_LOGIN;
  private xsrf = inject(HttpXsrfTokenExtractor);

  constructor(private router: Router, private http: HttpClient, private userService: UserService) {
    // setInterval( ()=> {
    //   this.http.head(this.base + '/refreshLogin', {withCredentials: true}).subscribe(
    //     suc => {console.log('Refreshed login ' + suc)},
    //     error => {console.error(error)}
    //   );
    // }, 1000 * 60 * 10);
  }

  tryLogin() {
    if (!this.authenticated) {
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

  async logout() {
    console.debug("Logout: Calling Logout endpoint")
    await fetch(this.base + '/logout', {
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': this.xsrf.getToken()
      },
      redirect: 'manual'
    });

    console.debug("Logout: Clear user and session")
    this.userService.clearUserInfo();
    sessionStorage.clear();

    console.debug("Logout: Redirect to home")
    await this.router.navigate(['/']);
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
