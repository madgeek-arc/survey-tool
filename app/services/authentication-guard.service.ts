import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable, of} from "rxjs";
import {AuthenticationService} from "./authentication.service";
import {UserService} from "./user.service";
import {map, switchMap, take} from "rxjs/operators";


@Injectable()
export class AuthenticationGuardService implements CanActivate {

  constructor(private authenticationService: AuthenticationService, private userService: UserService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authenticationService.authenticated) {
      // console.log('preauthorized');
      return true;
    }

    return this.userService.getUserInfo().pipe(
      switchMap(res => {
        if (res !== null) {
          // console.log('Authorized');
          return of(true);
        } else {
          // console.log('Not authorized');
          this.router.navigate(["/home"]);
          return of(false);
        }
      })
    );

  }

}
