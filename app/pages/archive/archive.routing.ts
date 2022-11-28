import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ArchiveComponent} from "./archive.component";
import {NCTEPoliciesComponent} from "./policies/ncte-policies.component";
import {NCTEFundingComponent} from "./funding/ncte-funding.component";
import {NationalContributionsToEOSCGuardService} from "../../services/nationalContributionsToEOSC-guard.service";
import {NCTEMandate} from "./mandate/ncte-mandate";
import {NCTEOpenAccessComponent} from "./open-access/ncte-open-access.component";
import {NCTEMonitoringComponent} from "./monitoring/ncte-monitoring.component";
import {ArchiveGuardService} from "../../services/archiveGuard.service";

const nationalContributionsToEOSCDashboardRoutes: Routes = [
  {
    path: '',
    component: ArchiveComponent,
    canActivateChild: [ArchiveGuardService],
    children: [
      {
        path: '',
        redirectTo: 'policies',
        pathMatch: 'full',
      },
      {
        path: 'policies',
        component: NCTEPoliciesComponent,
      },
      {
        path: 'funding',
        component: NCTEFundingComponent,
      },
      {
        path: 'mandate',
        component: NCTEMandate,
      },
      {
        path: 'monitoring',
        component: NCTEMonitoringComponent,
      },
      {
        path: 'openAccess',
        component: NCTEOpenAccessComponent,
      }
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forChild(nationalContributionsToEOSCDashboardRoutes)],
  exports: [RouterModule]
})

export class ArchiveRouting {}
