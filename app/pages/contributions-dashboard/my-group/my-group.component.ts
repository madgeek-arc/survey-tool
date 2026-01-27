import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {UserService} from "../../../services/user.service";
import {Stakeholder, GroupMembers, UserGroup, Administrator, Coordinator} from "../../../domain/userInfo";
import {SurveyService} from "../../../services/survey.service";
import {StakeholdersService} from "../../../services/stakeholders.service";
import * as UIkit from 'uikit';

@Component({
    selector: 'app-contributions-my-group',
    templateUrl: './my-group.component.html',
    providers: [SurveyService, StakeholdersService],
    standalone: false
})

export class MyGroupComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();
  currentGroup: UserGroup = null;
  members: GroupMembers = null
  contributorEmail: string = null;
  userEmail: string = null;
  invitationToken: string = null;
  isManager: boolean = null;
  errorMessage: string = null;
  title = 'copy to clipboard';
  groupType: string | null = null;

  constructor(private userService: UserService, private surveyService: SurveyService, private route: ActivatedRoute,
              private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this._destroyed)).subscribe({
      next: params => {
        this.groupType = params['group'];
        switch (params['group']) {
          case 'stakeholder':
            this.userService.currentStakeholder.pipe(takeUntil(this._destroyed)).subscribe(next => {
              this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
              if (this.currentGroup !== null) {
                this.getMembers(params['group']);
              } else if (params['id']) {
                this.stakeholdersService.getStakeholder(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
                  res => {
                    this.currentGroup = res;
                    this.userService.changeCurrentStakeholder(res as Stakeholder);
                    // this.getMembers(params['group']);
                  },
                  error => console.error(error)
                );
              }
            });
            break;

            case 'coordinator':
              console.log('coordinator');
              this.userService.currentCoordinator.pipe(takeUntil(this._destroyed)).subscribe(next => {
                this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem('currentCoordinator'));
                if (this.currentGroup !== null) {
                  this.getMembers(params['group']);
                } else if (params['id']) {
                  this.stakeholdersService.getCoordinatorById(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
                    res => {
                      this.currentGroup = res;
                      this.userService.changeCurrentCoordinator(res as Coordinator);
                    },
                    error => console.error(error)
                  );
                }
              });
              break;

            case 'administration':
              console.log('administrator');
              this.userService.currentAdministrator.pipe(takeUntil(this._destroyed)).subscribe(next => {
                this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem('currentAdministrator'));
                if (this.currentGroup !== null) {
                  this.getMembers(params['group']);
                } else if (params['id']) {
                  this.stakeholdersService.getAdministrators(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
                    res => {
                      this.currentGroup = res;
                      this.userService.changeCurrentAdministrator(res as Administrator);
                    },
                    error => console.error(error)
                  );
                }
              });

              break;
           default:

        }
      }
    });
  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  getMembers(group: string) {
    switch (group) {
      case 'stakeholder':
        this.userService.getStakeholdersMembers(this.currentGroup.id).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.members = next;
          }, error => {
            console.error(error);
          }, () => {
            this.userEmail = this.userService.userId;
            this.isManager = this.checkIfManager(this.userEmail);
          }
        );
        break;

      case 'administration':
        this.userService.getAdministratorUsers(this.currentGroup.id).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.members = next;
          }, error => {
            console.error(error);
          }, () => {
            this.userEmail = this.userService.userId;
            this.isManager = this.checkIfManager(this.userEmail);
          }
        );

        break;

      case 'coordinator':
        this.userService.getCoordinatorUsers(this.currentGroup.id).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.members = next;
          }, error => {
            console.error(error);
          }, () => {
            this.userEmail = this.userService.userId;
            this.isManager = this.checkIfManager(this.userEmail);
          }
        )
        break
    }

    // if (this.userService.currentStakeholder.getValue()) {
    //
    // }  else if (this.userService.currentCoordinator.getValue()) {
    //
    // }
  }

  addContributor(contributor: string = 'contributor') {
    if (this.validateEmail(this.contributorEmail)) {

      this.surveyService.getInvitationToken(this.contributorEmail, contributor, this.currentGroup.id)
        .pipe(takeUntil(this._destroyed)).subscribe(
        next => {
          this.invitationToken = location.origin + '/invitation/accept/' + next.toString();
          this.errorMessage = null;
          this.contributorEmail = null;
          // UIkit.modal('#add-contributor-modal').hide();
        },
        error => {
          console.error(error);
          this.errorMessage = error.error.error;
        },
        () => {
          this.errorMessage = null;
          this.contributorEmail = null;
          // UIkit.modal('#add-contributor-modal').hide();
        }
      );
    } else {
      this.errorMessage = 'Please give a valid email address.'
    }
  }

  removeContributor() {
    this.surveyService.removeContributor(this.currentGroup.id, this.contributorEmail).pipe(takeUntil(this._destroyed)).subscribe(
      next => {
        // this.members = next;
        this.getMembers(this.groupType);
        this.errorMessage = null;
        this.contributorEmail = null;
        UIkit.modal('#remove-contributor-modal').hide();
      },
      error => {
        console.error(error)
        this.errorMessage = error.message;
      },
      () => {
        this.errorMessage = null;
        this.contributorEmail = null;
        UIkit.modal('#remove-contributor-modal').hide();
      }
    );
  }

  copyToClipboard() {
    // navigator clipboard api needs a secure context (https)
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(this.invitationToken);
      return;
    }
    navigator.clipboard.writeText(this.invitationToken).then( ()=> {
      this.title = 'copied to clipboard';
      // console.log('Async: Copying to clipboard was successful!');
    }).catch((err)=> {
      console.error('Async: Could not copy text: ', err);
    });
  }

  fallbackCopyTextToClipboard(text) { // this is deprecated support is not guaranteed
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful)
        this.title = 'copied to clipboard';
      // const msg = successful ? 'successful' : 'unsuccessful';
      // console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  showRemoveModal(email: string) {
    this.contributorEmail = email
    UIkit.modal('#remove-contributor-modal').show();
  }

  checkIfManager(email: string): boolean {
    for (let i = 0; i < this.members.admins.length; i++) {
      if (this.members.admins[i].email === email) {
        return true;
      }
    }
    return false;
  }

  closeModal() {
    this.contributorEmail = null;
    this.invitationToken = null;
    this.errorMessage = null;
  }

  validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
}
