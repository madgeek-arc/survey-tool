import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributionsDashboardRoutingModule } from "./contributions-dashboard-routing.module";
import { ReusableComponentsModule } from "../../shared/reusablecomponents/reusable-components.module";
import { ContributionsHomeComponent } from "./home/contributions-home.component";
import { MySurveysComponent } from "./my-surveys/my-surveys.component";
import { MyGroupComponent } from "./my-group/my-group.component";
import {SurveyCardComponent} from "./my-surveys/survey-card/survey-card.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoordinatorsComponent} from "./coordinators/coordinators.component";
import {NgSelectModule} from "@ng-select/ng-select";
import {SurveysListComponent} from "./coordinators/surveys-list/surveys-list.component";
import {HistoryComponent} from "./survey-history/history.component";
import {CompareModule} from "../../../catalogue-ui/pages/dynamic-form/compare-versions/compare.module";
import {SurveyToolModule} from "../../survey-tool.module";
import {StakeholdersComponent} from "./coordinators/stakeholders/stakeholders.component";
import {EditManagerComponent} from "./coordinators/stakeholders/edit-managers/edit-manager.component";

@NgModule ({
  imports: [
    CommonModule,
    ContributionsDashboardRoutingModule,
    ReusableComponentsModule,
    FormsModule,
    NgSelectModule,
    CompareModule,
    SurveyToolModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ContributionsHomeComponent,
    MySurveysComponent,
    MyGroupComponent,
    SurveyCardComponent,
    CoordinatorsComponent,
    SurveysListComponent,
    HistoryComponent,
    StakeholdersComponent,
    EditManagerComponent
  ],
  providers: [],
})

export class ContributionsDashboardModule {}
