import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { SurveyService } from "../../../services/survey.service";
import { DisplayEntries, DisplayHistory, Editor, SurveyAnswer } from "../../../domain/survey";
import { Model } from "../../../../catalogue-ui/domain/dynamic-form-model";
import { zip } from "rxjs/internal/observable/zip";

import * as UIkit from 'uikit';
import { NgClass, TitleCasePipe, DatePipe } from "@angular/common";
import { CompareSurveysComponent } from "../../../../catalogue-ui/pages/dynamic-form/compare-versions/surveys/compare-surveys.component";
import { UniquePipe } from "../../../../catalogue-ui/shared/pipes/uniquePipe.pipe";

@Component({
    selector: 'app-survey-history',
    templateUrl: 'history.component.html',
    styleUrls: ['./history.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, RouterLink, CompareSurveysComponent, TitleCasePipe, DatePipe, UniquePipe]
})

export class HistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);

  surveyAnswerId: string = null;
  surveyId: string = null;
  surveyAnswerHistory = signal<DisplayHistory>(null);
  selectedEntries = signal<DisplayEntries[]>([]);
  selectedVersion = signal<DisplayEntries>(null);
  editorsSet: Set<Editor> = new Set<Editor>();

  model = signal<Model>(null);
  surveyAnswerA = signal<SurveyAnswer>(null);
  surveyAnswerB = signal<SurveyAnswer>(null);
  tabsHeader = 'Sections';

  currentStakeholderId = null;

  loading = signal(false);
  hide = signal(false);

  ngOnInit() {
    this.loading.set(true);
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
        res.entries.sort((a, b) => b.time - a.time);
        this.surveyAnswerHistory.set(res);
        // this.loading = false;
      },
      error => {console.error(error)},
      () => {
        this.surveyAnswerA.set(null);
        zip(
          this.surveyService.getSurvey(this.surveyId),
          this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.surveyAnswerHistory().entries[0].version),
        ).subscribe(
          next => {
            this.model.set(next[0]);
            this.surveyAnswerA.set(next[1]);
            this.loading.set(false);
          },
          error => {console.log(error)},
          () => {this.selectedVersion.set(this.surveyAnswerHistory().entries[0]);}
        );
      }
    )
  }

  selectVersionToShow(versionEntry: DisplayEntries) {
    this.loading.set(true);
    let tmpModel: Model = this.model();
    this.model.set(null);
    this.surveyService.getAnswerWithVersion(this.surveyAnswerId, versionEntry.version).subscribe(
      next => {this.surveyAnswerA.set(next);},
      error => {console.log(error)},
      () => {
        this.selectedVersion.set(versionEntry);
        this.model.set(tmpModel);
        this.loading.set(false);
        // UIkit.scroll('#scrollTop').scrollTo('#title');
        window.scroll(0,0)
      }

    );
  }

  selectVersionsToCompare(event, version) {
    if (event.target.checked) {
      this.selectedEntries.update(entries => [...entries, version]);
    } else {
      const index = this.selectedEntries().indexOf(version);
      this.selectedEntries.update(entries => entries.filter((entry, i) => i !== index));
    }
  }

  showComparison() {
    this.loading.set(true);
    this.surveyAnswerA.set(null);
    this.surveyAnswerB.set(null);
    this.selectedEntries.update(entries => [...entries].sort((a, b) => a.time - b.time));
    zip(
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.selectedEntries()[0].version),
      this.surveyService.getAnswerWithVersion(this.surveyAnswerId, this.selectedEntries()[1].version),
      // this.surveyService.getSurvey(this.surveyId)
    ).subscribe(
      next => {
        this.surveyAnswerA.set(next[0]);
        this.surveyAnswerB.set(next[1]);

        UIkit.modal('#modal-full').show();
        this.hide.set(true);
        this.loading.set(false);
      },
      error => {console.log(error)},
      () => {}
    );
  }

  restoreVersion() {
    this.surveyService.restoreToVersion(this.surveyAnswerId, this.selectedVersion().version).subscribe(
      res => {
        this.selectedEntries.set([]);
        this.getSurveyAnswerHistory();
      },
      error => {console.log(error)}
    )
  }

  showHistoryContent() {
    this.hide.set(false);
  }
}
