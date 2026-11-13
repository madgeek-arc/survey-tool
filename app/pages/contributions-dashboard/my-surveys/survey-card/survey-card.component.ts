import { Component, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, inject, input, output, signal } from "@angular/core";
import { ResourcePermission, SurveyAnswer, SurveyInfo } from "../../../../domain/survey";
import { UserService } from "../../../../services/user.service";
import { Stakeholder } from "../../../../domain/userInfo";
import { SurveyService } from "../../../../services/survey.service";
import { Router, RouterLink } from "@angular/router";
import { Subscriber } from "rxjs";
import { ImportSurveyData, Model } from "../../../../../catalogue-ui/domain/dynamic-form-model";
import { ReadMoreTextComponent } from "../../../../../catalogue-ui/shared/reusable-components/read-more.component";
import { DatePipe } from "@angular/common";

@Component({
    selector: 'app-survey-card',
    templateUrl: './survey-card.component.html',
    providers: [SurveyService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReadMoreTextComponent, RouterLink, DatePipe]
})

export class SurveyCardComponent implements OnChanges, OnDestroy {
  private userService = inject(UserService);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  readonly survey = input<Model>();
  readonly selectedSurvey = output<ImportSurveyData>();

  subscriptions = [];
  currentGroup: Stakeholder = null;
  surveyAnswer = signal<SurveyAnswer>(null);
  surveyInfo = signal<SurveyInfo>(null);
  permissions = signal<ResourcePermission[]>(null);

  ngOnChanges(changes: SimpleChanges) {
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(
        next => {
          this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
          if (this.currentGroup !== null) {
            this.subscriptions.push(
              this.surveyService.getLatestAnswer(this.currentGroup.id, this.survey().id).subscribe(
                next => {
                  this.surveyAnswer.set(next);
                  this.subscriptions.push(
                    this.surveyService.getPermissions([this.surveyAnswer().id]).subscribe(next => {
                      this.permissions.set(next);
                    })
                  );
                },
                error => {console.error(error)})
            );
            this.subscriptions.push(
              this.surveyService.getSurveyInfoByGroup(this.currentGroup.id).subscribe(
                next => {
                  this.surveyInfo.set(next.results.find(info => info.surveyId === this.survey().id) ?? null);
                },
                error => {console.error(error)})
            );
          }
        },
        error => {console.error(error)},
        () => {})
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  daysLeft(): number | null {
    if (!this.survey()?.submissionCloseAt) return null;
    const diff = new Date(this.survey().submissionCloseAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  checkForPermission(right: string): boolean {
    for (const permission of this.permissions()) {
      if (permission.permissions.includes(right))
        return true;
    }
    return false;
  }

  changeValidStatus(answerId: string, valid: boolean) {
    if (valid) {
      this.subscriptions.push(
        this.surveyService.changeAnswerValidStatus(answerId, !valid).subscribe(next => {
          this.surveyAnswer.set(next);
          this.subscriptions.push(
            this.surveyService.getPermissions([this.surveyAnswer().id]).subscribe(next => {
              this.permissions.set(next);
            },
            error => {console.error(error)}
            )
          );
        },
        error => {console.error(error)}
        )
      );
    } else {
      this.router.navigate([`contributions/${this.currentGroup.id}/mySurveys/${this.survey().id}/answer/validate`]);
    }
  }

  emitSurveyForImport() {
    let data: ImportSurveyData = new class implements ImportSurveyData {
      importFrom: string[] = [];
      importFromNames: string[] = [];
      surveyId: string;
      surveyAnswerId: string;
    };
    data.importFrom = this.survey().configuration.importFrom;
    data.surveyId = this.survey().id;
    data.surveyAnswerId = this.surveyAnswer().id;
    this.selectedSurvey.emit(data);
  }

}
