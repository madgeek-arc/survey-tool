import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReusableComponentsModule} from "../../shared/reusablecomponents/reusable-components.module";
import {NationalContributionsToEOSCDashboardRouting} from "./national-contributions-to-eosc-dashboard.routing";
import {NationalContributionsToEOSCDashboardComponent} from "./national-contributions-to-eosc-dashboard.component";
import {HighchartsChartModule} from "highcharts-angular";
import {DataService} from "../../services/data.service";
import {DataHandlerService} from "../../services/data-handler.service";
import {StakeholdersService} from "../../services/stakeholders.service";
import {PoliciesComponent} from "./policies/policies.component";
import {PracticesComponent} from "./practices/practices.component";
import {ArchiveModule} from "../archive/archive.module";
import {InvestmentsComponent} from "./investments/investments.component";

@NgModule({
  declarations: [
    NationalContributionsToEOSCDashboardComponent,
    PoliciesComponent,
    PracticesComponent,
    InvestmentsComponent
  ],
  imports: [
    CommonModule,
    ReusableComponentsModule,
    NationalContributionsToEOSCDashboardRouting,
    HighchartsChartModule,
    ArchiveModule
  ],
  providers: [
    DataService,
    DataHandlerService,
    StakeholdersService
  ],
})

export class NationalContributionsToEOSCDashboardModule {}
