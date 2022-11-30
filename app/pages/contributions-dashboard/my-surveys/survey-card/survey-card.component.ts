import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from "@angular/core";
import {SurveyAnswer, ResourcePermission} from "../../../../domain/survey";
import {UserService} from "../../../../services/user.service";
import {Stakeholder} from "../../../../domain/userInfo";
import {SurveyService} from "../../../../services/survey.service";
import {Router} from "@angular/router";
import {Subscriber} from "rxjs";
import {Model} from "../../../../../catalogue-ui/domain/dynamic-form-model";

@Component({
  selector: 'app-survey-card',
  templateUrl: './survey-card.component.html',
  providers: [SurveyService]
})

export class SurveyCardComponent implements OnChanges, OnDestroy {
  @Input() survey: Model;

  subscriptions = [];
  currentGroup: Stakeholder = null;
  surveyAnswer: SurveyAnswer = null
  permissions: ResourcePermission[] = null;
  chapterIds: string[] = [];

  constructor(private userService: UserService, private surveyService: SurveyService, private router: Router) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(
        next => {
          this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
          if (this.currentGroup !== null) {
            this.subscriptions.push(
              this.surveyService.getLatestAnswer(this.currentGroup.id, this.survey.id).subscribe(
                next => {
                  this.surveyAnswer = next;
                  this.subscriptions.push(
                    this.surveyService.getPermissions([this.surveyAnswer.id]).subscribe(next => {
                      this.permissions = next;
                    })
                  );
                })
            );
          }
        },
        error => {console.error(error)},
        () => {})
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  checkForPermission(right: string): boolean {
    for (const permission of this.permissions) {
      if (permission.permissions.includes(right))
        return true;
    }
    return false;
  }

  changeValidStatus(answerId: string, valid: boolean) {
    if (valid) {
      this.subscriptions.push(
        this.surveyService.changeAnswerValidStatus(answerId, !valid).subscribe(next => {
          this.surveyAnswer = next;
          this.subscriptions.push(
            this.surveyService.getPermissions([this.surveyAnswer.id]).subscribe(next => {
              this.permissions = next;
            },
            error => {console.error(error)}
            )
          );
        },
        error => {console.error(error)}
        )
      );
    } else {
      this.router.navigate([`contributions/${this.currentGroup.id}/mySurveys/${this.survey.id}/answer/validate`]);
    }
  }

}
