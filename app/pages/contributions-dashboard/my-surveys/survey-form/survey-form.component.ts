import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UntypedFormGroup } from "@angular/forms";
import { zip } from "rxjs/internal/observable/zip";
import { SurveyComponent } from "../../../../../catalogue-ui/pages/dynamic-form/survey.component";
import { Model } from "../../../../../catalogue-ui/domain/dynamic-form-model";
import { SurveyService } from "../../../../services/survey.service";
import { SurveyAnswer } from "../../../../domain/survey";
import { Stakeholder, UserActivity, UserInfo } from "../../../../domain/userInfo";
import { WebsocketService } from "../../../../services/websocket.service";
import { StakeholdersService } from "../../../../services/stakeholders.service";
import { UserService } from "../../../../services/user.service";
import seedRandom from 'seedrandom';
import * as UIkit from 'uikit';


@Component({
    selector: 'app-survey-form',
    templateUrl: 'survey-form.component.html',
    providers: [SurveyService, StakeholdersService],
    standalone: false
})

export class SurveyFormComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private surveyService = inject(SurveyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private wsService = inject(WebsocketService);
  private userService =  inject(UserService);

  @ViewChild(SurveyComponent) child: SurveyComponent

  survey: Model = null;
  subType: string;
  surveyAnswer: SurveyAnswer = null;
  activeUsers: UserActivity[] = [];
  userInfo: UserInfo = null;
  tabsHeader: string = null;
  mandatoryFieldsText: string = 'Fields with (*) are mandatory and must be completed in order for the survey to be validated.';
  downloadPDF: boolean = true;
  surveyId: string = null;
  stakeholderId: string = null;
  freeView = false;
  readonly = false;
  validate = false;
  ready = false;
  action: string = null;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.ready = false;
    this.tabsHeader = 'Sections';

    this.route.url.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
    next => {
      this.validate = (next[next.length - 1].path === 'validate');
      this.freeView = (next[next.length - 1].path === 'freeView');
      this.readonly = (next[next.length - 1].path === 'view');

      this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        this.surveyId = params['surveyId'];
        if (params['stakeholderId']) {
          this.stakeholderId = params['stakeholderId'];
        } else {
          this.stakeholderId = params['id'];
        }
        this.updateUserInfo();

        if (!this.freeView) {
          zip(
            this.surveyService.getLatestAnswer(this.stakeholderId, this.surveyId).pipe(takeUntilDestroyed(this.destroyRef)),
            this.surveyService.getSurvey(this.surveyId).pipe(takeUntilDestroyed(this.destroyRef))).subscribe(
            next => {
              this.surveyAnswer = next[0];
              this.survey = next[1];
            },
            error => {console.log(error)},
            () => {
              this.ready = true;
              this.wsService.initializeWebSocketConnection(this.surveyAnswer.id, this.surveyAnswer.type);
              if (this.router.url.includes('/view')) {
                this.action = 'view';
              } else if (this.router.url.includes('/validate')) {
                this.action = 'validate';
              } else {
                this.action = 'edit';
              }
              this.wsService.WsJoin(this.action);
            }
          );
        } else {

          this.activeUsers = [];
          this.surveyService.getSurvey(this.surveyId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            next => {this.survey = next;},
            error => {console.log(error)},
            () => { this.ready = true; }
          );
        }
      });
    });


    this.wsService.activeUsers.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      next => {
        this.removeClass(this.activeUsers);
        this.activeUsers = next;
        this.activeUsers?.forEach( user => {
          user.color = this.getRandomDarkColor(user.sessionId);
          if(user.position) {
            let sheet = window.document.styleSheets[0];

            let styleExists = false;
            for (let i = 0; i < sheet.cssRules.length; i++) {
              if(sheet.cssRules[i] instanceof CSSStyleRule) {
                if((sheet.cssRules[i] as CSSStyleRule).selectorText === `.user-${user.sessionId}`) {
                  styleExists = true;
                  break;
                }
              }
            }
            if (!styleExists)
              sheet.insertRule(`.user-${user.sessionId} { border-color: ${this.getRandomDarkColor(user.sessionId)} !important}`, sheet.cssRules.length);

            // console.log(sheet);
          }
        });
        this.addClass(this.activeUsers);
      }
    );
  }

  ngOnDestroy() {
    if (this.surveyAnswer?.id) {
      this.wsService.WsLeave(this.action);
    }
    this.wsService.closeWs();
  }


  findSubType(stakeholders: Stakeholder[], stakeholderId: string): string {
    for (const stakeholder of stakeholders) {
      if (stakeholder.id === stakeholderId)
        return stakeholder.subType;
    }
    return null;
  }

  validateSurveyAnswer(valid: boolean) {
    console.log('Is valid: ', valid);
    this.surveyService.changeAnswerValidStatus(this.surveyAnswer.id, !this.surveyAnswer.validated).subscribe({
      next: () => {
        UIkit.modal('#validation-modal').hide();
        this.router.navigate([`/contributions/${this.stakeholderId}/mySurveys`]).then();
      }, error: (error) => {
        console.error(error)
      }
    });
  }

  submitForm(form: UntypedFormGroup) {
    if (this.freeView) {
      return;
    } else {
      this.surveyService.putAnswer(form.value, this.surveyAnswer.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        res => {
          this.successMessage = 'Updated successfully!';
          this.child.clearChapterChangesMap();
          UIkit.modal('#unsaved-changes-modal').hide();
          this.surveyAnswer.answer = res;
        },
        error => {
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(error?.error?.message);
          UIkit.modal('#unsaved-changes-modal').hide();
          // this.showLoader = false;
          // console.log(error);
        },
        () => {
          this.child.closeSuccessAlert();
          // this.showLoader = false;
        }
      );
    }
  }

  updateUserInfo() {
    this.userService.getUserObservable().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      this.userInfo = next;
      if (this.userInfo) {
        this.subType = this.findSubType(this.userInfo.stakeholders, this.stakeholderId);

        this.userInfo.stakeholders.every(sh => {
          if (sh.id === this.stakeholderId) {
            this.userService.changeCurrentStakeholder(sh);
            return false;
          }
          return true;
        });

        this.userInfo.coordinators.every(co => {
          if (co.id === this.stakeholderId) {
            this.userService.changeCurrentCoordinator(co);
            return false;
          }
          return true;
        });

      }
    });
  }

  // Other
  getInitials(fullName: string) {
    return fullName.split(" ").map((n)=>n[0]).join("")
  }

  actionIcon(action: string) {
    switch (action) {
      case 'view':
        return 'visibility';
      case 'validate':
        return 'task_alt';
      case 'edit':
        return 'edit';
      default:
        return '';
    }
  }

  actionTooltip(action: string) {
    switch (action) {
      case 'view':
        return 'viewing';
      case 'validate':
        return 'validating';
      case 'edit':
        return 'editing';
      default:
        return '';
    }
  }

  getRandomDarkColor(sessionId: string) { // (use for a background with white/light font color)
    const rng = seedRandom(sessionId);
    const h = Math.floor(rng() * 1000 % 361),
      s = Math.floor(rng() * 80 + 20) + '%', // set s above 20 to avoid similar grayish tones
      // max value of l is 100, but limit it from 15 to 70 to generate darker colors
      l = Math.floor(rng() * 55 + 15) + '%';
    // console.log(`h= ${h}, s= ${s}, l= ${l}`);
    return `hsl(${h},${s},${l})`;
  };


  /** Mark the field as active --> **/
  addClass(users: UserActivity[]) {
    users?.forEach( user => {
      if (!user.position)
        return;

      const htmlElement = document.getElementById(user.position);
      if (htmlElement)
        htmlElement.classList.add(`user-${user.sessionId}`)
    });
  }

  removeClass(users: UserActivity[]) {
    users?.forEach( user => {
      if (!user.position)
        return;

      const htmlElement = document.getElementById(user.position);
      if (htmlElement)
        htmlElement.classList.remove(`user-${user.sessionId}`);
    });
  }
  /** <-- Mark field as active **/
}
