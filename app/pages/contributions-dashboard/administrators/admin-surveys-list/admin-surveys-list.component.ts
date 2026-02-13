import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Paging} from "../../../../../catalogue-ui/domain/paging";
import {Model} from "../../../../../catalogue-ui/domain/dynamic-form-model";
import {Administrator} from "../../../../domain/userInfo";
import {SurveyService} from "../../../../services/survey.service";
import {StakeholdersService} from "../../../../services/stakeholders.service";
import {UserService} from "../../../../services/user.service";
import {SurveyToolModule} from "../../../../survey-tool.module";
import {DatePipe} from "@angular/common";
import {
  SidebarMobileToggleComponent
} from "../../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {PageContentComponent} from "../../../../shared/page-content/page-content.component";
import {URLParameter} from "../../../../domain/url-parameter";
import {SurveyInfo} from "../../../../domain/survey";


@Component({
  selector: 'app-admin-surveys-list',
  templateUrl: 'admin-surveys-list.component.html',
  providers: [StakeholdersService],
  imports: [
    RouterLink,
    SurveyToolModule,
    DatePipe,
    SidebarMobileToggleComponent,
    PageContentComponent
  ],
  standalone: true
})
export class AdminSurveysListComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();
  administrator: Administrator = null;
  surveys: Paging<Model> = null;
  currentSurveys: Model[] = [];
  previousSurveys: Model[] = [];
  draftSurveys: Model[] = [];

  private surveyService = inject(SurveyService);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);
  private userService = inject(UserService);
  surveyAnswersInfo: { [id: string]: boolean } = {};

  constructor() {
  }

  ngOnInit() {
    this.administrator = JSON.parse(sessionStorage.getItem('currentAdministrator'));

    if (!this.administrator) {
      this.route.params.pipe(takeUntil(this._destroyed)).subscribe(
        params => {
          if (params['id']) {
            this.stakeholdersService.getAdministratorById(params['id']).pipe(takeUntil(this._destroyed)).subscribe(
              res => {
                this.administrator = res;
                this.userService.changeCurrentAdministrator(this.administrator);
              },
              error => console.error(error),
              () => {
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
    this.surveyService.getSurveys('type', this.administrator.type).subscribe(
      next => {
        this.surveys = next;
        this.draftSurveys = [];
        this.currentSurveys = [];
        this.previousSurveys = [];

        this.surveys.results.forEach(model => {
          if (!model.locked) this.draftSurveys.push(model);
          else if (model.active) this.currentSurveys.push(model);
          else this.previousSurveys.push(model);

          const urlParameters: URLParameter[] = [
            {key: 'groupId', values: [this.administrator.id]},
            {key: 'surveyId', values: [model.id]}
          ];

          this.surveyService.getSurveyEntries(urlParameters).subscribe({
            next: (res: Paging<SurveyInfo>) => {
              this.surveyAnswersInfo[model.id] = res && res.total > 0;
              this.surveyAnswersInfo = { ...this.surveyAnswersInfo };
              console.log(`Survey ${model.id} has answers:`, this.surveyAnswersInfo[model.id]);
            },
            error: err => console.error(err)
          });
        });
      },
      error => console.error(error)
    );
  }

  generateAnswers(surveyId: string) {
    this.surveyService.generateAnswers(surveyId).pipe(takeUntil(this._destroyed)).subscribe({
      next: () => {
        this.surveyAnswersInfo[surveyId] = true;
        this.surveyAnswersInfo = { ...this.surveyAnswersInfo };
      },
      error: err => {
        console.error('Error generating answers');
      }
    })
  }
}



