import {Component, OnDestroy, OnInit} from "@angular/core";
import {Stakeholder, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {SurveyService} from "../../../services/survey.service";
import {Model} from "../../../../catalogue-ui/domain/dynamic-form-model";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {forEach} from "@angular-devkit/schematics";

@Component({
  selector: 'app-contributions-my-surveys',
  templateUrl: './my-surveys.component.html',
  providers: [SurveyService, StakeholdersService]
})

export class MySurveysComponent implements OnInit, OnDestroy{

  private _destroyed: Subject<boolean> = new Subject();
  id: string = null;
  stakeholder: Stakeholder = null;
  surveys: Paging<Model>;
  top: Model[] = [];
  bottom: Model[] = [];

  constructor(private userService: UserService, private surveyService: SurveyService,
              private route: ActivatedRoute, private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this._destroyed)).subscribe(
      params => {
        this.id = params['id']
        if (this.id)
          this.getStakeholder();
      }
    );
  }

  getStakeholder() {
    this.stakeholdersService.getStakeholder(this.id).pipe(takeUntil(this._destroyed)).subscribe(
      res => { this.stakeholder = res; },
      error => { console.error(error); },
      () => {}
    );

    let userInfo: UserInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo) {
      userInfo.stakeholders.forEach(sh => {
        if (sh.id === this.id)
          this.stakeholder = sh;
      });
    }

    if (this.stakeholder) {
      this.userService.currentStakeholder.next(this.stakeholder);
      this.surveyService.getSurveys('stakeholderId', this.stakeholder.id).pipe(takeUntil(this._destroyed))
        .subscribe(next => {
            this.surveys = next;
            this.surveys.results.forEach(model => {
              if (model.locked && model.active)
                this.top.push(model);
              if (model.locked && !model.active)
                this.bottom.push(model);
            });
          }
        );
    }

  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

}
