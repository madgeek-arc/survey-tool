import {Component, OnDestroy, OnInit} from "@angular/core";
import {Stakeholder, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {SurveyService} from "../../../services/survey.service";
import {ImportSurveyData, Model} from "../../../../catalogue-ui/domain/dynamic-form-model";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {StakeholdersService} from "../../../services/stakeholders.service";

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
  importFromData: ImportSurveyData = null;
  importSelection: string = '';
  showAlert= false;
  top: Model[] = [];
  bottom: Model[] = [];

  constructor(private userService: UserService, private surveyService: SurveyService, private router: Router,
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

    let userInfo: UserInfo = this.userService.getCurrentUserInfo();
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
        });
    }

  }

  importSurveyAnswer() {
    if (this.importFromData && this.importSelection) {
      this.surveyService.importSurveyAnswer(this.importFromData.surveyAnswerId,this.importSelection)
        .pipe(takeUntil(this._destroyed)).subscribe(
        res => {
          this.router.navigate([this.importFromData.surveyId+'/answer'], {relativeTo: this.route});
        }, error => {console.error(error)},
        () => { this.clearModal() }
      );
    } else {
      this.showAlert = true;
    }

  }

  getSurveysForImport(survey: ImportSurveyData) {
    this.importFromData = survey;
    for (let i = 0; i < this.importFromData.importFrom.length; i++) {
      this.surveys.results.forEach(model => {
        if (model.id === this.importFromData.importFrom[i]) {
          this.importFromData.importFromNames[i] = model.name;
          return;
        }
      });
    }

  }

  clearModal() {
    this.importFromData = null;
    this.importSelection = '';
  }

  clearError() {
    setTimeout(()=> {
      this.showAlert = false;
    }, 600);
  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

}
