import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot,} from "@angular/router";
import {of} from "rxjs";
import {catchError, map, switchMap} from "rxjs/operators";
import {inject} from "@angular/core";
import {AuthenticationService} from "./authentication.service";
import {UserService} from "./user.service";


export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);
  const userService = inject(UserService);

  if (authenticationService.authenticated) {
    // console.log('preauthorized');
    return true;
  }

  return userService.getUserInfo().pipe(

    switchMap(res => {
      if (res !== null) {
        // console.log('Authorized');
        return of(true);
      } else {
        // console.log('Not authorized');
        authenticationService.tryLogin();
        router.navigate(["/home"]);
        return of(false);
      }
    }),
    catchError(() => {
      // console.log('Not authorized 2');
      authenticationService.tryLogin();
      router.navigate(["/home"]);
      return of(false);
    })
  );
}
