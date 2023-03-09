import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SurveyService} from "../../../services/survey.service";
import {DisplayHistory, SurveyAnswer} from "../../../domain/survey";
import {Model} from "../../../../catalogue-ui/domain/dynamic-form-model";

import UIkit from "uikit";
import {zip} from "rxjs/internal/observable/zip";

@Component({
  selector: 'app-survey-history',
  templateUrl: 'history.component.html'
})

export class HistoryComponent implements OnInit {

  surveyAnswerId: string = null;
  surveyId: string = null;
  surveyAnswerHistory: DisplayHistory = null;
  versionIdArray: string[] = [];

  model: Model = null;
  surveyAnswerA: SurveyAnswer = null;
  surveyAnswerB: SurveyAnswer = null;
  tabsHeader = 'Sections';

  constructor(private route: ActivatedRoute, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.surveyAnswerId = params['answerId'];
      this.surveyId = params['surveyId'];
      // console.log(this.surveyAnswerId);
      this.surveyService.getAnswerHistory(this.surveyAnswerId).subscribe(
        res => {
          this.surveyAnswerHistory = res;
          this.surveyAnswerHistory.entries.sort((a, b) => b.time - a.time);
        },
        error => {console.error(error)}
      )
    });
  }

  selectVersion(event, version) {
    if (event.target.checked) {
      this.versionIdArray.push(version);
    } else {
      this.versionIdArray.splice(this.versionIdArray.indexOf(version), 1);
    }
  }

  showComparison() {
    this.surveyAnswerA = null;
    this.surveyAnswerB = null;
    zip(
      this.surveyService.getSurvey(this.surveyId),
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.versionIdArray[0]),
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.versionIdArray[1])
    ).subscribe(
      next => {
        this.model = next[0];
        this.surveyAnswerA = next[1];
        this.surveyAnswerB = next[2];

        UIkit.modal('#modal-full').show();
      },
      error => {console.log(error)},
      () => {}
    );
  }
}
