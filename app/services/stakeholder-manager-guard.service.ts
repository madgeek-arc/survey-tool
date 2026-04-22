import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from "@angular/router";
import { of } from "rxjs";
import { catchError, switchMap} from "rxjs/operators";
import { inject} from "@angular/core";
import { UserService} from "./user.service";

export const StakeholderManagerGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const stakeholderId = route.paramMap.get('id');

  return userService.getUserInfo().pipe(
    switchMap(userInfo => {
      if (!userInfo) {
        router.navigate(['/home']);
        return of(false);
      }
      const stakeholder = userInfo.stakeholders?.find(
        s => s.id === stakeholderId
      );
      const isManager = (stakeholder?.admins
        ?.includes(userInfo.user.email)) ?? false;

      if (!isManager) {
        router.navigate(['/contributions/' + stakeholderId + '/stakeholder']);
        return of(false);
      }

      return of(true);
    }),
    catchError(() => {
      router.navigate(['/home']);
      return of(false);
    })
  )
}
