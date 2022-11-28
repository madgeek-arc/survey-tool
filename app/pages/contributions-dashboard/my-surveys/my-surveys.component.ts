import {Component, OnDestroy, OnInit} from "@angular/core";
import {Stakeholder} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {SurveyService} from "../../../services/survey.service";
import {Model} from "../../../../catalogue-ui/domain/dynamic-form-model";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-contributions-my-surveys',
  templateUrl: './my-surveys.component.html',
  providers: [SurveyService]
})

export class MySurveysComponent implements OnInit, OnDestroy{

  subscriptions = [];
  currentGroup: Stakeholder = null;
  surveys: Paging<Model>;

  constructor(private userService: UserService, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(
        next => {
          this.currentGroup = next;
          if (this.currentGroup !== null) {
            this.subscriptions.push(
              this.surveyService.getSurveys('stakeholderId', this.currentGroup.id).subscribe(next => {
                this.surveys = next;
              })
            );
          }
        },
        error => {console.error(error)},
        () => {}
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

}
