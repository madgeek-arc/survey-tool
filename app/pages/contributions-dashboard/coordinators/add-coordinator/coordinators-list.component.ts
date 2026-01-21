import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {StakeholdersService} from "../../../../services/stakeholders.service";
import {Administrator, Coordinator, GroupMembers, User} from "../../../../domain/userInfo";
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
  private stakeholdersService = inject(StakeholdersService);
  private route = inject(ActivatedRoute);

  administrator: Administrator = null;
  members: GroupMembers = null;

  selectedMemberEmail: string;
  selectedMemberId: string;
  errorMessage: string;

  private administratorId: string;
  coordinatorType: string;
  coordinatorId: string;

  newCoordinatorId: string = '';
  newCoordinatorName: string = '';
  newCoordinatorType: string = '';

  editingCoordinatorName: string = '';

  coordinators: Coordinator[] = [];
  users: Map<string, User[]> = new Map();

  isLoading: boolean = true;

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
    this.isLoading = true;

    this.stakeholdersService
      .getCoordinators(this.coordinatorType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.coordinators = res.results || [];
          this.coordinators.sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
          console.log('All Coordinators:', this.coordinators);
          if (this.coordinators.length === 0) {
            this.isLoading = false;
            return;
          }

          let loadedCount = 0;

          this.coordinators.forEach(coord => {
            this.stakeholdersService.getCoordinatorUsers(coord.id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: value => {
                  this.users.set(coord.id, value.members);
                  loadedCount++;
                  if (loadedCount === this.coordinators.length) {
                    this.isLoading = false;
                  }
                },
                error: () => {
                  loadedCount++;
                  if (loadedCount === this.coordinators.length) {
                    this.isLoading = false;
                  }
                }
              });
          });
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load coordinators';
          this.isLoading = false;
        }
      });
  }

  resetModal(): void {
    this.selectedMemberEmail = null;
    this.errorMessage = null;
    this.newCoordinatorName = '';
    this.newCoordinatorId = '';

  }

  openAddMemberModal(coordId: string) {
    this.coordinatorId = coordId;
    this.selectedMemberEmail = null;
    this.errorMessage = null;
    UIkit.modal('#add-coordinator-modal').show();
  }

  addCoordinatorMember(): void {
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

  openRemoveModal(coordId: string, memberId: string): void {
    this.coordinatorId = coordId;
    this.selectedMemberId = memberId;
    UIkit.modal('#remove-coordinator-modal').show();
  }

  createCoordinatorGroup(): void {
    if (!this.newCoordinatorId || !this.newCoordinatorName) {
      this.errorMessage = 'Please provide ID and Name';
      return;
    }

    const newCoord: Coordinator = {
      id: this.newCoordinatorId,
      name: this.newCoordinatorName,
      type: this.coordinatorType,
      admins: [],
      members: []
    } as Coordinator;

    this.stakeholdersService.postCoordinator(newCoord)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.coordinators.push(res);
          const modalElement = document.getElementById('create-coordinator-modal');
          if (modalElement) {
            UIkit.modal(modalElement).hide();
          }

          // UIkit.modal('#create-coordinator-modal').hide();
          this.resetModal();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'Failed to create coordinator'
        }
      });
  }

  openEditModal(coord: Coordinator) {
    this.coordinatorId = coord.id;
    this.editingCoordinatorName = coord.name;
    UIkit.modal('#edit-coordinator-modal').show();
  }

  updateCoordinatorGroup(): void {
    if (!this.editingCoordinatorName || this.editingCoordinatorName.trim() === '') {
      this.errorMessage = 'Name cannot be empty';
      return;
    }

    const updatedCoord = {
      id: this.coordinatorId,
      name: this.editingCoordinatorName,
      type: this.coordinatorType,
      admins: [],
      members: []
    } as Coordinator;

    this.stakeholdersService.putCoordinator(updatedCoord)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const index = this.coordinators.findIndex(c => c.id === updatedCoord.id);

          if (index !== -1) {
            this.coordinators[index].name = res.name;
            this.coordinators.sort((a, b) => a.name.localeCompare(b.name));
          }
          const modalElement = document.getElementById('edit-coordinator-modal');
          if (modalElement) {
            UIkit.modal(modalElement).hide();
          }
          this.resetModal();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to update coordinator';
        }
      });
  }
}

