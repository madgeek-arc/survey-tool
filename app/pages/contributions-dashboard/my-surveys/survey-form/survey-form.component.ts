import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {SurveyComponent} from "../../../../../catalogue-ui/pages/dynamic-form/survey.component";
import {Model} from "../../../../../catalogue-ui/domain/dynamic-form-model";
import {SurveyService} from "../../../../services/survey.service";
import {UserService} from "../../../../services/user.service";
import {SurveyAnswer} from "../../../../domain/survey";
import {Subscriber} from "rxjs";
import {zip} from "rxjs/internal/observable/zip";

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
  surveyAnswers: SurveyAnswer = null
  tabsHeader: string = null;
  mandatoryFieldsText: string = 'Fields with (*) are mandatory and must be completed in order for the survey to be validated.';
  downloadPDF: boolean = true;
  surveyId: string = null;
  stakeholderId: string = null;
  freeView = false;
  ready = false;

  constructor(private surveyService: SurveyService, private userService: UserService, private route: ActivatedRoute,
              private router: Router) {}

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

              if (!this.freeView) {
                console.log('skata');
                console.log(sessionStorage.getItem('currentStakeholder'))
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
