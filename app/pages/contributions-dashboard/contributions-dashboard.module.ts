import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributionsDashboardRoutingModule } from "./contributions-dashboard-routing.module";
import { ReusableComponentsModule } from "../../shared/reusablecomponents/reusable-components.module";
import { ContributionsHomeComponent } from "./home/contributions-home.component";
import { MySurveysComponent } from "./my-surveys/my-surveys.component";
import { MyGroupComponent } from "./my-group/my-group.component";
import {SurveyCardComponent} from "./my-surveys/survey-card/survey-card.component";
import {FormsModule} from "@angular/forms";
import {CoordinatorsComponent} from "./coordinators/coordinators.component";
import {NgSelectModule} from "@ng-select/ng-select";
import {SurveysListComponent} from "./coordinators/surveys-list/surveys-list.component";
import {HistoryComponent} from "./survey-history/history.component";

@NgModule ({
  imports: [
    CommonModule,
    ContributionsDashboardRoutingModule,
    ReusableComponentsModule,
    FormsModule,
    NgSelectModule,
  ],
  declarations: [
    ContributionsHomeComponent,
    MySurveysComponent,
    MyGroupComponent,
    SurveyCardComponent,
    CoordinatorsComponent,
    SurveysListComponent,
    HistoryComponent
  ],
  providers: [],
})

export class ContributionsDashboardModule {}
