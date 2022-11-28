import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {AuthenticationService} from "./authentication.service";


@Injectable()
export class AuthenticationGuardService implements CanActivate {

  constructor(public authenticationService: AuthenticationService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // console.log('going through auth guard');
    if (!this.authenticationService.authenticated) {
      this.authenticationService.tryLogin();
    }
    return this.authenticationService.authenticated;

  }

}
