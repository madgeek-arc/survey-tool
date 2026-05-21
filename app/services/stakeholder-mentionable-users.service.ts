import { inject, Injectable } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { MentionableUser, MentionableUsersProvider } from "../../catalogue-ui/domain/mentionable-user";
import { StakeholdersService } from "./stakeholders.service";

@Injectable()
export class StakeholderMentionableUsersProvider extends MentionableUsersProvider {
  private stakeholdersService = inject(StakeholdersService);
  private cache = new Map<string, Observable<MentionableUser[]>>();

  getUsers(stakeholderId: string): Observable<MentionableUser[]> {
    if (!this.cache.has(stakeholderId)) {
      const obs$ = combineLatest([
        this.stakeholdersService.getStakeholderMembers(stakeholderId),
        this.stakeholdersService.getStakeholderManagersPublic(stakeholderId)
      ]).pipe(
        map(([groupMembers, managers]) => {
          const allUsers = [
            ...groupMembers.members,
            ...groupMembers.admins,
            ...managers
          ];

          return allUsers
            .filter((user, index, self) =>
              user.email &&
              index === self.findIndex(u => u.email === user.email)
            )
            .map(user => ({ email: user.email, name: user.fullname }));
        }),
        shareReplay(1)
      );
      this.cache.set(stakeholderId, obs$);
    }
    return this.cache.get(stakeholderId)!;
  }
}
