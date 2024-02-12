import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { SurveyFormComponent } from "./my-surveys/survey-form/survey-form.component";
import { ContributionsHomeComponent } from "./home/contributions-home.component";
import { MySurveysComponent } from "./my-surveys/my-surveys.component";
import { MyGroupComponent } from "./my-group/my-group.component";
import {AuthGuard} from "../../services/auth-guard.service";
import {CoordinatorsComponent} from "./coordinators/coordinators.component";
import {SurveysListComponent} from "./coordinators/surveys-list/surveys-list.component";
import {HistoryComponent} from "./survey-history/history.component";
import {StakeholdersComponent} from "./coordinators/stakeholders/stakeholders.component";
import {EditManagerComponent} from "./coordinators/stakeholders/edit-managers/edit-manager.component";

const contributionsDashboardRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        component: ContributionsHomeComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'mySurveys',
        component: MySurveysComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'mySurveys/:surveyId/answer',
        component: SurveyFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'surveyTemplates/:surveyId/freeView',
        component: SurveyFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'mySurveys/:surveyId/answer/view',
        component: SurveyFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'stakeholder/:stakeholderId/survey/:surveyId/view',
        component: SurveyFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'mySurveys/:surveyId/answer/validate',
        component: SurveyFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'mySurveys/:surveyId/:answerId/history',
        component: HistoryComponent,
        canActivate: [AuthGuard],
        data: {
          showSideMenu: false,
          showFooter: false
        }
      },
      {
        path: 'surveys/:surveyId/:answerId/history',
        component: HistoryComponent,
        canActivate: [AuthGuard],
        data: {
          showSideMenu: false,
          showFooter: false
        }
      },
      {
        path: 'group',
        component: MyGroupComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'surveys',
        component: CoordinatorsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'surveyTemplates',
        component: SurveysListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'stakeholders',
        component: StakeholdersComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'stakeholders/:id',
        component: EditManagerComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule ({
  imports: [RouterModule.forChild(contributionsDashboardRoutes)],
  exports: [RouterModule]
})

export class ContributionsDashboardRoutingModule {}
