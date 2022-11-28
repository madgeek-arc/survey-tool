import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {UserService} from "./user.service";
import {Stakeholder} from "../domain/userInfo";


@Injectable()
export class NationalContributionsToEOSCGuardService implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.userService.userInfo) {
      return this.fail();
    }
    if (this.userService.userInfo.coordinators.filter(c => c.type === 'country').length > 0) {
      return true;
    }
    if (this.userService.userInfo.stakeholders.filter(c => c.type === 'country').length > 0) {
      let stakeHolders: Stakeholder[] = this.userService.userInfo.stakeholders.filter(c => c.type === 'country');
      for (const stakeHolder of stakeHolders) {
        if (stakeHolder.managers.indexOf(this.userService.userInfo.user.email) >= 0)
          return true;
      }
      return this.fail();
    }

    return this.fail();
  }

  fail(): boolean {
    this.router.navigate(['/']).then();
    return false;
  }
}
