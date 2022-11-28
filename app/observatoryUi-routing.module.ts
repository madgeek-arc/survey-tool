import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./pages/home.component";
import {FormBuilderComponent} from "../catalogue-ui/pages/form-builder/form-builder.component";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {AuthenticationGuardService} from "./services/authentication-guard.service";

const observatoryUiRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'fb',
    component: FormBuilderComponent
  },
  {
    path: 'invitation/accept/:invitationToken',
    component: AcceptInvitationComponent,
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'contributions/:id',
    loadChildren: () => import('./pages/contributions-dashboard/contributions-dashboard.module').then(m => m.ContributionsDashboardModule),
  },
  {
    path: 'archive',
    loadChildren: () => import('./pages/archive/archive.module').then(m => m.ArchiveModule)
  },
  {
    path: 'eoscreadiness',
    loadChildren: () => import('./pages/national-contributions-to-eosc-dashboard/national-contributions-to-eosc-dashboard.module').then(m => m.NationalContributionsToEOSCDashboardModule),
  },
]

@NgModule({
  imports: [RouterModule.forChild(observatoryUiRoutes)],
  exports: [RouterModule]
})

export class ObservatoryUiRoutingModule { }
