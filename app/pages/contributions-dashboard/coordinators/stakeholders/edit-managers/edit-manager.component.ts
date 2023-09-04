import {Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../../../../services/user.service";
import {Stakeholder, GroupMembers} from "../../../../../domain/userInfo";
import {SurveyService} from "../../../../../services/survey.service";

import UIkit from 'uikit';
import {Subscriber, zip} from "rxjs";
import {StakeholdersService} from "../../../../../services/stakeholders.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-edit-managers',
  templateUrl: 'edit-managers.component.html',
  providers: [SurveyService, StakeholdersService]
})

export class EditManagerComponent implements OnInit, OnDestroy {

  subscriptions = [];
  stakeholderId: string = null;
  stakeholder: Stakeholder = null;
  members: GroupMembers = null
  email: string = null;


  currentGroup: Stakeholder = null;
  userEmail: string = null;
  invitationToken: string = null;
  // isManager: boolean = null;
  errorMessage: string = null;
  title = 'copy to clipboard';

  constructor(private userService: UserService, private route: ActivatedRoute, private surveyService: SurveyService,
              private stakeholderService: StakeholdersService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.subscribe( params => {
        this.stakeholderId = params['id'];
        this.subscriptions.push(
          zip(this.stakeholderService.getStakeholder(this.stakeholderId),
            this.stakeholderService.getStakeholderMembers(this.stakeholderId)).subscribe(
            res => {
                this.stakeholder = res[0];
                this.members = res[1];
              },
            error => {console.error(error)}
          )
        );
      })

      // this.userService.currentStakeholder.subscribe(next => {
      //   this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
      //   if (this.currentGroup !== null) {
      //     this.subscriptions.push(
      //       this.userService.getStakeholdersMembers(this.currentGroup.id).subscribe(next => {
      //           this.members = next;
      //         },
      //         error => {
      //           console.error(error);
      //         },
      //         () => {
      //           this.userEmail = this.userService.userId;
      //           this.isManager = this.checkIfManager(this.userEmail);
      //         }
      //       )
      //     );
      //   }
      // })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  addManager(role: string = 'manager') {
    if (this.validateEmail(this.email)) {
      this.subscriptions.push(
        this.surveyService.getInvitationToken(this.email, role, this.stakeholder.id).subscribe(
          next => {
            this.invitationToken = location.origin + '/invitation/accept/' + next.toString();
            this.errorMessage = null;
            this.email = null;
            // UIkit.modal('#add-manager-modal').hide();
          },
          error => {
            console.error(error);
            this.errorMessage = error.error.error;
          },
          () => {
            this.errorMessage = null;
            this.email = null;
            // UIkit.modal('#add-manager-modal').hide();
          }
        )
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

  removeManager() {
    this.subscriptions.push(
      this.surveyService.removeManager(this.stakeholder.id, this.email).subscribe(
        next => {
          this.members = next;
          this.errorMessage = null;
          this.email = null;
          UIkit.modal('#remove-manager-modal').hide();
        },
        error => {
          console.error(error)
          this.errorMessage = error.message;
        },
        () => {
          this.errorMessage = null;
          this.email = null;
          UIkit.modal('#remove-manager-modal').hide();
        }
      )
    );
  }

  removeContributors() {
    this.subscriptions.push(
      this.surveyService.removeContributor(this.stakeholder.id, this.email).subscribe(
        next => {
          this.members = next;
          this.errorMessage = null;
          this.email = null;
          UIkit.modal('#remove-contributors-modal').hide();
        },
        error => {
          console.error(error)
          this.errorMessage = error.message;
        },
        () => {
          this.errorMessage = null;
          this.email = null;
          UIkit.modal('#remove-contributors-modal').hide();
        }
      )
    );
  }

  showRemoveModal(email: string, modalId: string) {
    this.email = email
    UIkit.modal(modalId).show();
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
    this.email = null;
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
