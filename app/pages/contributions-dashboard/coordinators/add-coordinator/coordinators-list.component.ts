import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Administrator, Coordinator, GroupMembers, User } from "../../../../domain/userInfo";
import { PageContentComponent } from "../../../../shared/page-content/page-content.component";
import { StakeholdersService } from "../../../../services/stakeholders.service";
import {
  SidebarMobileToggleComponent
} from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { UserService } from "../../../../services/user.service";
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
  private userService = inject(UserService);
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

  editingCoordinatorName: string = '';
  private errorTimeout: any;
  isSaving: boolean = false;

  coordinators: Coordinator[] = [];
  users: Map<string, User[]> = new Map();

  isLoading: boolean = true;
  coordinatorToDeleteId: string | null = null;

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

  showError(message: string): void {
    this.errorMessage = message;

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
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
          this.userService.updateUserInfo();
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
    if (!this.newCoordinatorName) {
      this.errorMessage = 'Please provide Name';
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
    if (this.isSaving) {
      return;
    }
    if (!this.editingCoordinatorName || this.editingCoordinatorName.trim() === '') {
      this.showError('Name cannot be empty');
      return;
    }

    this.isSaving = true;

    const existingCoord = this.coordinators.find(c => c.id ===  this.coordinatorId);

    const updatedCoord = {
      id: this.coordinatorId,
      name: this.editingCoordinatorName,
      type: this.coordinatorType,
      admins: existingCoord.admins,
      members: existingCoord.members
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
          this.isSaving = false;
          this.userService.updateUserInfo();
        },
        error: (err) => {
          console.error(err);
          this.showError('Failed to update coordinator');
          this.isSaving = false;
        }
      });
  }

  openDeleteCoordinatorModal(coord: Coordinator): void {
    this.coordinatorToDeleteId = coord.id;
    UIkit.modal('#delete-coordinator-group-modal').show();
  }

  deleteCoordinatorGroup(): void {
    if (!this.coordinatorToDeleteId || this.isSaving) return;
    this.isSaving = true;

    this.stakeholdersService.deleteCoordinator(this.coordinatorToDeleteId)
     .pipe(takeUntilDestroyed(this.destroyRef))
     .subscribe({
       next: () => {
         this.coordinators = this.coordinators.filter(c => c.id !== this.coordinatorId);
         this.users.delete(this.coordinatorToDeleteId);

         const modalElement = document.getElementById('delete-coordinator-group-modal');
         if (modalElement) {
           UIkit.modal(modalElement).hide();
         }
         this.coordinatorToDeleteId = null;
         this.isSaving = false;
         this.userService.updateUserInfo();
       },
       error: (err) => {
         console.error(err);
         this.showError('Failed to delete coordinator');
         this.isSaving = false;
       }
     });
  }
}

