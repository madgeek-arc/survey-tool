import { inject, Injectable } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MentionableUser, MentionableUsersProvider } from "../../catalogue-ui/domain/mentionable-user";
import { StakeholdersService } from "./stakeholders.service";

@Injectable()
export class StakeholderMentionableUsersProvider extends MentionableUsersProvider {
  private stakeholdersService = inject(StakeholdersService);

  getUsers(stakeholderId: string): Observable<MentionableUser[]> {
    return combineLatest([
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
      })
    );
  }
}
