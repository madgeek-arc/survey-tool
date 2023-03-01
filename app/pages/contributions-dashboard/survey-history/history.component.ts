import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {SurveyService} from "../../../services/survey.service";
import {SurveyAnswer} from "../../../domain/survey";

@Component({
  selector: 'app-survey-history',
  templateUrl: 'history.component.html'
})

export class HistoryComponent implements OnInit {

  surveyAnswerId: string = null;
  surveyAnswer: SurveyAnswer;

  constructor(private route: ActivatedRoute, private surveyService: SurveyService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.surveyAnswerId = params['answerId'];
      console.log(this.surveyAnswerId);
      this.surveyService.getAnswer(this.surveyAnswerId).subscribe(
        res => {
          this.surveyAnswer = res
          this.surveyAnswer.history.entries.sort((a, b) => b.time - a.time)
        },
        error => {console.error(error)}
      )
    });
  }
}
