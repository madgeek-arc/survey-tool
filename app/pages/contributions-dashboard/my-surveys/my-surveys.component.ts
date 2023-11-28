import {Component, OnDestroy, OnInit} from "@angular/core";
import {Stakeholder, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {SurveyService} from "../../../services/survey.service";
import {Model} from "../../../../catalogue-ui/domain/dynamic-form-model";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-contributions-my-surveys',
  templateUrl: './my-surveys.component.html',
  providers: [SurveyService]
})

export class MySurveysComponent implements OnInit, OnDestroy{

  private _destroyed: Subject<boolean> = new Subject();
  groupId: string = null;
  currentGroup: Stakeholder = null;
  surveys: Paging<Model>;

  constructor(private userService: UserService, private surveyService: SurveyService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this._destroyed)).subscribe(
      params => {
        this.groupId = params['id']
        if (this.groupId)
          this.matchCurrentGroupFromUserInfo();
      }
    );
  }

  matchCurrentGroupFromUserInfo() {
    let userInfo: UserInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo) {
      userInfo.stakeholders.forEach(sh => {
        if (sh.id === this.groupId)
          this.currentGroup = sh;
      });
    }

    if (this.currentGroup) {
      this.userService.currentStakeholder.next(this.currentGroup);
      this.surveyService.getSurveys('stakeholderId', this.currentGroup.id)
        .pipe(takeUntil(this._destroyed)).subscribe(next => {
        this.surveys = next;
      });
    }

  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

}
