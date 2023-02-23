import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {zip} from "rxjs/internal/observable/zip";
import {SurveyComponent} from "../../../../../catalogue-ui/pages/dynamic-form/survey.component";
import {Model} from "../../../../../catalogue-ui/domain/dynamic-form-model";
import {SurveyService} from "../../../../services/survey.service";
import {SurveyAnswer} from "../../../../domain/survey";
import {Stakeholder, UserInfo} from "../../../../domain/userInfo";
import {WebsocketService} from "../../../../services/websocket.service";
import {Subscriber} from "rxjs";
import UIkit from "uikit";

@Component({
  selector: 'app-survey-form',
  templateUrl: 'survey-form.component.html',
  providers: [SurveyService]
})

export class SurveyFormComponent implements OnInit, OnDestroy {
  @ViewChild(SurveyComponent) child: SurveyComponent

  subscriptions = [];
  survey: Model = null;
  subType: string;
  surveyAnswers: SurveyAnswer = null
  userInfo: UserInfo = null;
  tabsHeader: string = null;
  mandatoryFieldsText: string = 'Fields with (*) are mandatory and must be completed in order for the survey to be validated.';
  downloadPDF: boolean = true;
  surveyId: string = null;
  stakeholderId: string = null;
  freeView = false;
  ready = false;

  constructor(private surveyService: SurveyService, private route: ActivatedRoute,
              private router: Router, private wsService: WebsocketService) {}

  ngOnInit() {
    this.ready = false;
    this.tabsHeader = 'Sections';

    this.subscriptions.push(
      this.route.url.subscribe(
        next => {
          this.freeView = (next[next.length - 1].path === 'freeView');

          this.subscriptions.push(
            this.route.params.subscribe(params => {
              this.surveyId = params['surveyId'];
              if (params['stakeholderId']) {
                this.stakeholderId = params['stakeholderId'];
              } else {
                this.stakeholderId = params['id'];
              }
              this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
              this.subType = this.findSubType(this.userInfo.stakeholders, this.stakeholderId);
              if (!this.freeView) {
                this.subscriptions.push(
                  zip(
                    this.surveyService.getLatestAnswer(this.stakeholderId, this.surveyId),
                    this.surveyService.getSurvey(this.surveyId)).subscribe(
                    next => {
                      this.surveyAnswers = next[0];
                      this.survey = next[1];
                    },
                    error => {console.log(error)},
                    () => { this.ready = true; }
                  )
                );
              } else {
                this.surveyService.getSurvey(this.surveyId).subscribe(
                  next => {this.survey = next;},
                  error => {console.log(error)},
                  () => { this.ready = true; }
                );
              }
              this.wsService.sendMessage('?active');
            })
          );
        }
      )
    );

  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
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
    this.surveyService.changeAnswerValidStatus(this.surveyAnswers.id, !this.surveyAnswers.validated).subscribe(
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

}
