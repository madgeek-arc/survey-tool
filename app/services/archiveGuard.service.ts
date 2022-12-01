import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {UserService} from "./user.service";

@Injectable()
export class ArchiveGuardService implements CanActivateChild {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.userService.userInfo) {
      return this.fail();
    }
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    return userInfo.coordinators.filter(c => c.type === 'country').length > 0;

  }

  fail(): boolean {
    this.router.navigate(['/']).then();
    return false;
  }
}
