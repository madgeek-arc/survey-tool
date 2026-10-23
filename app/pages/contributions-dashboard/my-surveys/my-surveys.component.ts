import {Component, ElementRef, OnDestroy, OnInit, viewChild} from "@angular/core";
import {Stakeholder} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {SurveyService} from "../../../services/survey.service";
import {ImportSurveyData, Model} from "../../../../catalogue-ui/domain/dynamic-form-model";
import {Subject} from "rxjs";
import {filter, take, takeUntil} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {StakeholdersService} from "../../../services/stakeholders.service";

@Component({
    selector: 'app-contributions-my-surveys',
    templateUrl: './my-surveys.component.html',
    providers: [SurveyService, StakeholdersService],
    standalone: false
})

export class MySurveysComponent implements OnInit, OnDestroy{

  private _destroyed: Subject<boolean> = new Subject();
  id: string = null;
  stakeholder: Stakeholder = null;
  surveys: Paging<Model>;
  importFromData: ImportSurveyData = null;
  importSelection: string = '';
  showAlert= false;
  currentSurveys: Model[] = [];
  previousSurveys: Model[] = [];
  importModal = viewChild<ElementRef<HTMLElement>>('importModal');

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

    // after a page reload the user info is only available once its request returns
    this.userService.getUserObservable().pipe(filter(userInfo => !!userInfo), take(1), takeUntil(this._destroyed))
      .subscribe(userInfo => {
        const stakeholder = userInfo.stakeholders.find(sh => sh.id === this.id);
        if (stakeholder) {
          this.stakeholder = stakeholder;
          this.getSurveys();
        }
      });
  }

  getSurveys() {
    this.userService.currentStakeholder.next(this.stakeholder);
    this.surveyService.getSurveys('stakeholderId', this.stakeholder.id).pipe(takeUntil(this._destroyed))
      .subscribe(next => {
        this.surveys = next;
        this.currentSurveys = next.results.filter(model => model.locked && model.active);
        this.previousSurveys = next.results.filter(model => model.locked && !model.active);
      });
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
    // UIkit moves the modal to <body> when it is first shown, so it outlives the component unless removed here
    this.importModal()?.nativeElement.remove();
  }

}
