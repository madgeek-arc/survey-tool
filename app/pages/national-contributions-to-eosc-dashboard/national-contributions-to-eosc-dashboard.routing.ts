import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {NationalContributionsToEOSCDashboardComponent} from "./national-contributions-to-eosc-dashboard.component";
import {NationalContributionsToEOSCGuardService} from "../../services/nationalContributionsToEOSC-guard.service";
import {PoliciesComponent} from "./policies/policies.component";
import {PracticesComponent} from "./practices/practices.component";
import {InvestmentsComponent} from "./investments/investments.component";

const nationalContributionsToEOSCDashboardRoutes: Routes = [
  {
    path: '',
    component: NationalContributionsToEOSCDashboardComponent,
    // canActivateChild: [NationalContributionsToEOSCGuardService],
    children: [
      {
        path: '',
        redirectTo: 'policies',
        pathMatch: 'full',
      },
      {
        path: 'policies',
        component: PoliciesComponent,
      },
      {
        path: 'practices',
        component: PracticesComponent,
      },
      {
        path: 'investments',
        component: InvestmentsComponent,
        canActivate: [NationalContributionsToEOSCGuardService]
      }
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forChild(nationalContributionsToEOSCDashboardRoutes)],
  exports: [RouterModule]
})

export class NationalContributionsToEOSCDashboardRouting {}
