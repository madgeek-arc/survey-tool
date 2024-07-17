import {Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { zip } from "rxjs/internal/observable/zip";
import { SurveyComponent } from "../../../../../catalogue-ui/pages/dynamic-form/survey.component";
import { Model } from "../../../../../catalogue-ui/domain/dynamic-form-model";
import { SurveyService } from "../../../../services/survey.service";
import { SurveyAnswer } from "../../../../domain/survey";
import { Stakeholder, UserActivity, UserInfo } from "../../../../domain/userInfo";
import { WebsocketService } from "../../../../services/websocket.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { StakeholdersService } from "../../../../services/stakeholders.service";
import { UserService } from "../../../../services/user.service";
import UIkit from "uikit";

@Component({
  selector: 'app-survey-form',
  templateUrl: 'survey-form.component.html',
  providers: [SurveyService, StakeholdersService]
})

export class SurveyFormComponent implements OnInit, OnDestroy {
  @ViewChild(SurveyComponent) child: SurveyComponent

  private _destroyed: Subject<boolean> = new Subject();
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
  ready = false;
  action: string = null;

  constructor(private surveyService: SurveyService, private route: ActivatedRoute, private router: Router,
              private wsService: WebsocketService, private userService: UserService) {}

  ngOnInit() {
    this.ready = false;
    this.tabsHeader = 'Sections';

    this.route.url.pipe(takeUntil(this._destroyed)).subscribe(
    next => {
      this.freeView = (next[next.length - 1].path === 'freeView');

      this.route.params.pipe(takeUntil(this._destroyed)).subscribe(params => {
        this.surveyId = params['surveyId'];
        if (params['stakeholderId']) {
          this.stakeholderId = params['stakeholderId'];
        } else {
          this.stakeholderId = params['id'];
        }
        this.updateUserInfo();

        // this.wsService.msg.pipe(takeUntil(this._destroyed)).subscribe(
        // next => {
        //     this.activeUsers = next;
        //   }
        // );
        if (!this.freeView) {
          zip(
            this.surveyService.getLatestAnswer(this.stakeholderId, this.surveyId).pipe(takeUntil(this._destroyed)),
            this.surveyService.getSurvey(this.surveyId).pipe(takeUntil(this._destroyed))).subscribe(
            next => {
              this.surveyAnswer = next[0];
              this.survey = next[1];
            },
            error => {console.log(error)},
            () => {
              this.ready = true;
              // this.wsService.initializeWebSocketEditConnection(this.surveyAnswer.id, this.surveyAnswer.type);
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
          this.surveyService.getSurvey(this.surveyId).pipe(takeUntil(this._destroyed)).subscribe(
            next => {this.survey = next;},
            error => {console.log(error)},
            () => { this.ready = true; }
          );
        }
      });
    });
  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
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
    this.surveyService.changeAnswerValidStatus(this.surveyAnswer.id, !this.surveyAnswer.validated).subscribe(
      next => {
        UIkit.modal('#validation-modal').hide();
        this.router.navigate([`/contributions/${this.stakeholderId}/mySurveys`]);
      },
      error => {
        console.error(error);
      },
      () => {});
  }

  submitForm(value) {
    if (this.freeView) {
      return;
    } else {
      this.child.onSubmit();
    }
  }

  updateUserInfo() {
    this.userService.getUserObservable().pipe(takeUntil(this._destroyed)).subscribe(next => {
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

}
