import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SurveyService} from "../../../services/survey.service";
import {DisplayEntries, DisplayHistory, SurveyAnswer} from "../../../domain/survey";
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
  selectedEntries: DisplayEntries[] = [];

  model: Model = null;
  surveyAnswerA: SurveyAnswer = null;
  surveyAnswerB: SurveyAnswer = null;
  tabsHeader = 'Sections';

  loading: boolean = false;

  constructor(private route: ActivatedRoute, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      this.surveyAnswerId = params['answerId'];
      this.surveyId = params['surveyId'];
      // console.log(this.surveyAnswerId);
      this.surveyService.getAnswerHistory(this.surveyAnswerId).subscribe(
        res => {
          this.surveyAnswerHistory = res;
          this.surveyAnswerHistory.entries.sort((a, b) => b.time - a.time);
          this.loading = false;
        },
        error => {console.error(error)}
      )
    });
  }

  selectVersion(event, version) {
    if (event.target.checked) {
      this.selectedEntries.push(version);
    } else {
      this.selectedEntries.splice(this.selectedEntries.indexOf(version), 1);
    }
  }

  showComparison() {
    this.loading = true;
    this.surveyAnswerA = null;
    this.surveyAnswerB = null;
    this.selectedEntries.sort((a, b) => a.time - b.time);
    zip(
      this.surveyService.getSurvey(this.surveyId),
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.selectedEntries[0].version),
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.selectedEntries[1].version)
    ).subscribe(
      next => {
        this.model = next[0];
        this.surveyAnswerA = next[1];
        this.surveyAnswerB = next[2];

        UIkit.modal('#modal-full').show();
        this.loading = false;
      },
      error => {console.log(error)},
      () => {}
    );
  }
}
