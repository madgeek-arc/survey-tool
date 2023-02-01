import {Component, OnInit} from "@angular/core";
import {Paging} from "../../../../../catalogue-ui/domain/paging";
import {Model} from "../../../../../catalogue-ui/domain/dynamic-form-model";
import {UserService} from "../../../../services/user.service";
import {SurveyService} from "../../../../services/survey.service";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-survey-lists',
  templateUrl: 'surveys-list.component.html'
})

export class SurveysListComponent implements OnInit{

  subscriptions = [];
  surveys: Paging<Model> = null;

  constructor(private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.surveyService.getSurveys('type', 'country').subscribe(
        next => { this.surveys = next; },
        error => {console.error(error);}
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
