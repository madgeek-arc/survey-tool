import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {UserService} from "../../../services/user.service";
import {Stakeholder, GroupMembers} from "../../../domain/userInfo";
import {SurveyService} from "../../../services/survey.service";
import {StakeholdersService} from "../../../services/stakeholders.service";
import UIkit from 'uikit';

@Component({
  selector: 'app-contributions-my-group',
  templateUrl: './my-group.component.html',
  providers: [SurveyService, StakeholdersService]
})

export class MyGroupComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();
  currentGroup: Stakeholder = null;
  members: GroupMembers = null
  // stakeholder: Stakeholder = null;
  contributorEmail: string = null;
  userEmail: string = null;
  invitationToken: string = null;
  isManager: boolean = null;
  errorMessage: string = null;
  title = 'copy to clipboard';

  constructor(private userService: UserService, private surveyService: SurveyService, private route: ActivatedRoute,
              private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    this.userService.currentStakeholder.pipe(takeUntil(this._destroyed)).subscribe(next => {
      this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
      if (this.currentGroup !== null) {
        this.getMembers();
      } else {
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(
          params => {
            if (params['id']) {
              this.stakeholdersService.getStakeholder(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
                res => {
                  this.currentGroup = res;
                  this.userService.changeCurrentStakeholder(this.currentGroup);
                },
                error => console.error(error),
                ()=> { this.getMembers(); }
              );
            }
          }
        )
      }
    });

  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  getMembers() {
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

  removeContributor() {
    this.surveyService.removeContributor(this.currentGroup.id, this.contributorEmail).pipe(takeUntil(this._destroyed)).subscribe(
      next => {
        this.members = next;
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
