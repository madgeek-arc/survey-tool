import {Component, ElementRef, OnDestroy, OnInit, viewChild, ChangeDetectionStrategy, inject, signal} from "@angular/core";
import {Stakeholder} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {SurveyService} from "../../../services/survey.service";
import {ImportSurveyData, Model} from "../../../../catalogue-ui/domain/dynamic-form-model";
import {Observable, of, Subject} from "rxjs";
import {catchError, filter, map, take, takeUntil} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {Progress} from "../../../domain/survey";
import { PageContentComponent } from "../../../shared/page-content/page-content.component";
import { SidebarMobileToggleComponent } from "../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { SurveyCardComponent } from "./survey-card/survey-card.component";
import { FormsModule } from "@angular/forms";
import { NgClass, AsyncPipe } from "@angular/common";

@Component({
    selector: 'app-contributions-my-surveys',
    templateUrl: './my-surveys.component.html',
    providers: [SurveyService, StakeholdersService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageContentComponent, SidebarMobileToggleComponent, SurveyCardComponent, FormsModule, NgClass, AsyncPipe]
})

export class MySurveysComponent implements OnInit, OnDestroy{

  private _destroyed: Subject<boolean> = new Subject();
  id: string = null;
  stakeholder: Stakeholder = null;
  surveys: Paging<Model>;
  importFromData = signal<ImportSurveyData>(null);
  importSelection = signal('');
  importProgress$: Observable<Record<string, Progress>> = null;
  showAlert = signal(false);
  currentSurveys = signal<Model[]>([]);
  previousSurveys = signal<Model[]>([]);
  importModal = viewChild<ElementRef<HTMLElement>>('importModal');

  private userService = inject(UserService);
  private surveyService = inject(SurveyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);

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
        this.currentSurveys.set(next.results.filter(model => model.locked && model.active));
        this.previousSurveys.set(next.results.filter(model => model.locked && !model.active));
      });
  }

  importSurveyAnswer() {
    if (this.importFromData() && this.importSelection()) {
      this.surveyService.importSurveyAnswer(this.importFromData().surveyAnswerId,this.importSelection())
        .pipe(takeUntil(this._destroyed)).subscribe(
        res => {
          this.router.navigate([this.importFromData().surveyId+'/answer'], {relativeTo: this.route});
        }, error => {console.error(error)},
        () => { this.clearModal() }
      );
    } else {
      this.showAlert.set(true);
    }

  }

  getSurveysForImport(survey: ImportSurveyData) {
    for (let i = 0; i < survey.importFrom.length; i++) {
      this.surveys.results.forEach(model => {
        if (model.id === survey.importFrom[i]) {
          survey.importFromNames[i] = model.name;
          return;
        }
      });
    }
    this.importFromData.set(survey);

    this.importProgress$ = this.surveyService.getSurveyInfoByGroup(this.stakeholder.id).pipe(
      map(info => Object.fromEntries(info.results.map(result => [result.surveyId, result.progressTotal]))),
      catchError(error => {
        console.error(error);
        return of({} as Record<string, Progress>);
      })
    );
  }

  clearModal() {
    this.importFromData.set(null);
    this.importSelection.set('');
    this.importProgress$ = null;
  }

  clearError() {
    setTimeout(()=> {
      this.showAlert.set(false);
    }, 600);
  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
    // UIkit moves the modal to <body> when it is first shown, so it outlives the component unless removed here
    this.importModal()?.nativeElement.remove();
  }

}
