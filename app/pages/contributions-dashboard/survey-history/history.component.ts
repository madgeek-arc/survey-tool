import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SurveyService} from "../../../services/survey.service";
import {DisplayEntries, DisplayHistory, SurveyAnswer} from "../../../domain/survey";
import {Model} from "../../../../catalogue-ui/domain/dynamic-form-model";

import UIkit from "uikit";
import {zip} from "rxjs/internal/observable/zip";

@Component({
  selector: 'app-survey-history',
  templateUrl: 'history.component.html',
  styleUrls: ['./history.component.css']
})

export class HistoryComponent implements OnInit {

  surveyAnswerId: string = null;
  surveyId: string = null;
  surveyAnswerHistory: DisplayHistory = null;
  selectedEntries: DisplayEntries[] = [];
  selectedVersion: DisplayEntries = null;

  model: Model = null;
  surveyAnswerA: SurveyAnswer = null;
  surveyAnswerB: SurveyAnswer = null;
  tabsHeader = 'Sections';

  currentStakeholderId = null;

  loading: boolean = false;
  hide = false;

  constructor(private route: ActivatedRoute, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      this.surveyAnswerId = params['answerId'];
      this.surveyId = params['surveyId'];
      this.currentStakeholderId = params['id'];
      // console.log(this.surveyAnswerId);
      this.getSurveyAnswerHistory();
    });
  }

  getSurveyAnswerHistory() {
    this.surveyService.getAnswerHistory(this.surveyAnswerId).subscribe(
      res => {
        this.surveyAnswerHistory = res;
        this.surveyAnswerHistory.entries.sort((a, b) => b.time - a.time);
        // this.loading = false;
      },
      error => {console.error(error)},
      () => {
        zip(
          this.surveyService.getSurvey(this.surveyId),
          this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.surveyAnswerHistory.entries[0].version),
        ).subscribe(
          next => {
            this.model = next[0];
            this.surveyAnswerA = next[1];
            this.loading = false;
          },
          error => {console.log(error)},
          () => {this.selectedVersion = this.surveyAnswerHistory.entries[0];}
        );
      }
    )
  }

  selectVersionToShow(versionEntry: DisplayEntries) {
    this.loading = true;
    let tmpModel: Model = this.model;
    this.model = null
    this.surveyService.getAnswerWithVersion(this.surveyAnswerId, versionEntry.version).subscribe(
      next => {this.surveyAnswerA = next;},
      error => {console.log(error)},
      () => {
        this.selectedVersion = versionEntry;
        this.model = tmpModel;
        this.loading = false;
        // UIkit.scroll('#scrollTop').scrollTo('#title');
        window.scroll(0,0)
      }

    );
  }

  selectVersionsToCompare(event, version) {
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
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.selectedEntries[0].version),
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.selectedEntries[1].version),
      // this.surveyService.getSurvey(this.surveyId)
    ).subscribe(
      next => {
        this.surveyAnswerA = next[0];
        this.surveyAnswerB = next[1];
        // this.model = next[2];

        UIkit.modal('#modal-full').show();
        this.hide = true;
        this.loading = false;
      },
      error => {console.log(error)},
      () => {}
    );
  }

  restoreVersion() {
    this.surveyService.restoreToVersion(this.surveyAnswerId, this.selectedEntries[0].version).subscribe(
      res => {
        this.selectedEntries = [];
        this.getSurveyAnswerHistory();
      },
      error => {console.log(error)}
    )
  }

  showHistoryContent() {
    this.hide = false;
  }
}
