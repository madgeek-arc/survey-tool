import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {UserService} from "../../../../services/user.service";
import {SurveyService} from "../../../../services/survey.service";
import {StakeholdersService} from "../../../../services/stakeholders.service";
import {Administrator, Coordinator, GroupMembers} from "../../../../domain/userInfo";
import {ActivatedRoute} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {PageContentComponent} from "../../../../shared/page-content/page-content.component";
import {
  SidebarMobileToggleComponent
} from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";

import {FormsModule} from "@angular/forms";
import UIkit from "uikit";

@Component({
  selector: 'app-new-coordinator',
  templateUrl: 'coordinators-list.component.html',
  standalone: true,
  imports: [
    PageContentComponent,
    SidebarMobileToggleComponent,
    FormsModule
],
  providers: [StakeholdersService]
})
export class NewCoordinatorComponent implements OnInit {

  private destroyRef = inject(DestroyRef);

  administrator: Administrator = null;
  members: GroupMembers = null;

  selectedMemberEmail: string;
  selectedMemberId: string;
  errorMessage: string;

  private administratorId: string;
  coordinatorType: string;
  coordinatorId: string;

  constructor(
    private userService: UserService,
    private surveyService: SurveyService,
    private stakeholdersService: StakeholdersService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (!params['id']) return;

        this.administratorId = params['id'];

        this.stakeholdersService
          .getAdministrators(this.administratorId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: admin => {
              this.administrator = admin;
              this.coordinatorType = admin.type;
              this.loadCoordinatorMembers();
            },
            error: () => this.errorMessage = 'Failed to load administrator'
          });
      });
  }

  loadCoordinatorMembers() {
    this.stakeholdersService
      .getCoordinators(this.coordinatorType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res?.results?.length) {
            this.members = {members: [], admins: []};
            return;
          }

          this.coordinatorId = res.results[0].id;
          this.stakeholdersService
            .getCoordinatorUsers(this.coordinatorId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: data => this.members = data,
              error: () => this.errorMessage = 'Failed to load coordinator members'
            });
        },
        error: () => this.errorMessage = 'Failed to load coordinators'
      });
  }

  resetModal(): void {
    this.selectedMemberEmail = null;
    this.errorMessage = null;
  }

  addCoordinator(): void {
    if (!this.selectedMemberEmail || !this.coordinatorId) {
      this.errorMessage = 'Invalid email or coordinator';
      return;
    }

    this.stakeholdersService
      .addCoordinatorMember(this.coordinatorId, this.selectedMemberEmail)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetModal();
          UIkit.modal('#add-coordinator-modal').hide();
          this.loadCoordinatorMembers();
        },
        error: () => this.errorMessage = 'Failed to add coordinator'
      });
  }

  confirmRemoveCoordinator(): void {
    if (!this.coordinatorId) return;

    this.stakeholdersService
      .removeCoordinatorMember(this.coordinatorId, this.selectedMemberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          UIkit.modal('#remove-coordinator-modal').hide();
          this.loadCoordinatorMembers();
        },
        error: () => this.errorMessage = 'Failed to delete coordinator'
      });
  }

  openRemoveModal(memberId: string): void {
    this.selectedMemberId = memberId;
    UIkit.modal('#remove-coordinator-modal').show();
  }
}

