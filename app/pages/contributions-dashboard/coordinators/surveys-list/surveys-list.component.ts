import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {Paging} from "../../../../../catalogue-ui/domain/paging";
import {Model} from "../../../../../catalogue-ui/domain/dynamic-form-model";
import {UserService} from "../../../../services/user.service";
import {SurveyService} from "../../../../services/survey.service";
import {Coordinator} from "../../../../domain/userInfo";
import {StakeholdersService} from "../../../../services/stakeholders.service";

@Component({
  selector: 'app-survey-lists',
  templateUrl: 'surveys-list.component.html',
  providers: [StakeholdersService]
})

export class SurveysListComponent implements OnInit{

  private _destroyed: Subject<boolean> = new Subject();
  coordinator: Coordinator = null;
  surveys: Paging<Model> = null;
  currentSurveys: Model[] = [];
  previousSurveys: Model[] = [];
  draftSurveys: Model[] = [];

  constructor(private surveyService: SurveyService, private route: ActivatedRoute,
              private stakeholdersService: StakeholdersService, private userService: UserService) {
  }

  ngOnInit() {
    this.coordinator = JSON.parse(sessionStorage.getItem('currentCoordinator'));
    if (!this.coordinator) {
      this.route.params.pipe(takeUntil(this._destroyed)).subscribe(
        params => {
          if (params['id']) {
            this.stakeholdersService.getCoordinatorById(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
              res => {
                this.coordinator = res;
                this.userService.changeCurrentCoordinator(this.coordinator);
              },
              error => console.error(error),
              ()=> {
                this.getSurveys();
              }
            );
          }
        }
      )
    } else {
      this.getSurveys();
    }

  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  getSurveys() {
    this.surveyService.getSurveys('type', this.coordinator.type).subscribe(
      next => {
        this.surveys = next;
        this.surveys.results.forEach(model => {
          if (!model.locked) {
            this.draftSurveys.push(model);
            return;
          }
          if (model.locked && model.active){
            this.currentSurveys.push(model);
            return;
          }
          if (model.locked && !model.active){
            this.previousSurveys.push(model);
            return;
          }
        });
      },
      error => {console.error(error);}
    );
  }

}
