import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from "@angular/core";
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StakeholdersService]
})
export class NewCoordinatorComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private stakeholdersService = inject(StakeholdersService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  administrator: Administrator = null;
  members: GroupMembers = null;

  selectedMemberEmail = signal<string>(undefined);
  selectedMemberId: string;
  errorMessage = signal<string>(undefined);

  private administratorId: string;
  coordinatorType: string;
  coordinatorId: string;

  newCoordinatorId: string = '';
  newCoordinatorName = signal('');

  editingCoordinatorName: string = '';
  private errorTimeout: any;
  isSaving = signal(false);

  coordinators = signal<Coordinator[]>([]);
  users = signal<Map<string, User[]>>(new Map());

  isLoading = signal(true);
  coordinatorToDeleteId = signal<string | null>(null);

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      let id = params['id'];
        if (id) {
          this.administratorId = id;
          this.initAdminGroup(id);
        }

        else if (this.route.parent) {
          this.route.parent.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(parentParams => {
            id = parentParams['id'];
            if (id) {
              this.administratorId = id;
              this.initAdminGroup(id);
            }
          })
        }

        this.stakeholdersService.getAdministrators(this.administratorId).pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: admin => {
              this.administrator = admin;
              this.coordinatorType = admin.type;
              this.loadCoordinatorMembers();
            },
            error: () => this.errorMessage.set('Failed to load administrator')
          });
      });
  }

  initAdminGroup(id: string) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdministrator'));
    if (sessionAdmin && sessionAdmin.id === id) {
      this.updateSidebarAndLoadData(sessionAdmin);
    } else {
      this.stakeholdersService.getAdministrators(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.updateSidebarAndLoadData(res);
          },
          error: () => this.errorMessage.set('Failed to load administrator')
        });
    }
  }

  updateSidebarAndLoadData(admin: Administrator) {
    this.userService.changeCurrentAdministrator(admin);
    this.administrator = admin;
    this.coordinatorType = admin.type;
    this.loadCoordinatorMembers();
  }

  loadCoordinatorMembers() {
    this.isLoading.set(true);

    this.stakeholdersService
      .getCoordinators(this.coordinatorType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          const coordinators = [...(res.results || [])];
          coordinators.sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
          this.coordinators.set(coordinators);
          if (coordinators.length === 0) {
            this.isLoading.set(false);
            return;
          }

          let loadedCount = 0;

          coordinators.forEach(coord => {
            this.stakeholdersService.getCoordinatorUsers(coord.id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: value => {
                  this.users.update(users => new Map(users).set(coord.id, value.members));
                  loadedCount++;
                  if (loadedCount === coordinators.length) {
                    this.isLoading.set(false);
                  }
                },
                error: () => {
                  loadedCount++;
                  if (loadedCount === coordinators.length) {
                    this.isLoading.set(false);
                  }
                }
              });
          });
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Failed to load coordinators');
          this.isLoading.set(false);
        }
      });
  }

  resetModal(): void {
    this.selectedMemberEmail.set(null);
    this.errorMessage.set(null);
    this.newCoordinatorName.set('');
    this.newCoordinatorId = '';

  }

  showError(message: string): void {
    this.errorMessage.set(message);

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    this.errorTimeout = setTimeout(() => {
      this.errorMessage.set(null);
    }, 3000);
  }

  openAddMemberModal(coordId: string) {
    this.coordinatorId = coordId;
    this.selectedMemberEmail.set(null);
    this.errorMessage.set(null);
    UIkit.modal('#add-coordinator-modal').show();
  }

  addCoordinatorMember(): void {
    if (!this.selectedMemberEmail() || !this.coordinatorId) {
      this.errorMessage.set('Invalid email or coordinator');
      return;
    }

    this.stakeholdersService
      .addCoordinatorMember(this.coordinatorId, this.selectedMemberEmail())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetModal();
          UIkit.modal('#add-coordinator-modal').hide();
          this.loadCoordinatorMembers();
          this.userService.updateUserInfo();
        },
        error: () => this.errorMessage.set('Failed to add coordinator')
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
        error: () => this.errorMessage.set('Failed to delete coordinator')
      });
  }

  openRemoveModal(coordId: string, memberId: string): void {
    this.coordinatorId = coordId;
    this.selectedMemberId = memberId;
    UIkit.modal('#remove-coordinator-modal').show();
  }

  createCoordinatorGroup(): void {
    if (!this.newCoordinatorName()) {
      this.errorMessage.set('Please provide Name');
      return;
    }

    const newCoord: Coordinator = {
      id: this.newCoordinatorId,
      name: this.newCoordinatorName(),
      type: this.coordinatorType,
      admins: [],
      members: []
    } as Coordinator;

    this.stakeholdersService.postCoordinator(newCoord)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.coordinators.update(coordinators => [...coordinators, res]);
          const modalElement = document.getElementById('create-coordinator-modal');
          if (modalElement) {
            UIkit.modal(modalElement).hide();
          }

          // UIkit.modal('#create-coordinator-modal').hide();
          this.resetModal();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage.set('Failed to create coordinator')
        }
      });
  }

  openEditModal(coord: Coordinator) {
    this.coordinatorId = coord.id;
    this.editingCoordinatorName = coord.name;
    UIkit.modal('#edit-coordinator-modal').show();
  }

  updateCoordinatorGroup(): void {
    if (this.isSaving()) {
      return;
    }
    if (!this.editingCoordinatorName || this.editingCoordinatorName.trim() === '') {
      this.showError('Name cannot be empty');
      return;
    }

    this.isSaving.set(true);

    const existingCoord = this.coordinators().find(c => c.id ===  this.coordinatorId);

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
          const index = this.coordinators().findIndex(c => c.id === updatedCoord.id);

          if (index !== -1) {
            const coordinators = this.coordinators().map((c, i) => i === index ? { ...c, name: res.name } : c);
            coordinators.sort((a, b) => a.name.localeCompare(b.name));
            this.coordinators.set(coordinators);
          }
          const modalElement = document.getElementById('edit-coordinator-modal');
          if (modalElement) {
            UIkit.modal(modalElement).hide();
          }
          this.resetModal();
          this.isSaving.set(false);
          this.userService.updateUserInfo();
        },
        error: (err) => {
          console.error(err);
          this.showError('Failed to update coordinator');
          this.isSaving.set(false);
        }
      });
  }

  openDeleteCoordinatorModal(coord: Coordinator): void {
    this.coordinatorToDeleteId.set(coord.id);
    UIkit.modal('#delete-coordinator-group-modal').show();
  }

  deleteCoordinatorGroup(): void {
    if (!this.coordinatorToDeleteId() || this.isSaving()) return;
    this.isSaving.set(true);

    this.stakeholdersService.deleteCoordinator(this.coordinatorToDeleteId())
     .pipe(takeUntilDestroyed(this.destroyRef))
     .subscribe({
       next: () => {
         const deletedId = this.coordinatorToDeleteId();
         this.coordinators.set(this.coordinators().filter(c => c.id !== deletedId));
         this.users.update(users => {
           const next = new Map(users);
           next.delete(deletedId);
           return next;
         });

         const modalElement = document.getElementById('delete-coordinator-group-modal');
         if (modalElement) {
           UIkit.modal(modalElement).hide();
         }
         this.coordinatorToDeleteId.set(null);
         this.isSaving.set(false);
         this.userService.updateUserInfo();
       },
       error: (err) => {
         console.error(err);
         this.showError('Failed to delete coordinator');
         this.isSaving.set(false);
       }
     });
  }
}

