import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SurveyService} from "../../../services/survey.service";
import {DisplayHistory} from "../../../domain/survey";

@Component({
  selector: 'app-survey-history',
  templateUrl: 'history.component.html'
})

export class HistoryComponent implements OnInit {

  surveyAnswerId: string = null;
  surveyAnswerHistory: DisplayHistory = null;

  constructor(private route: ActivatedRoute, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.surveyAnswerId = params['answerId'];
      console.log(this.surveyAnswerId);
      this.surveyService.getAnswerHistory(this.surveyAnswerId).subscribe(
        res => {
          this.surveyAnswerHistory = res
          this.surveyAnswerHistory.entries.sort((a, b) => b.time - a.time)
        },
        error => {console.error(error)}
      )
    });
  }
}
