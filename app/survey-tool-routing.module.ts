import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {FormBuilderComponent} from "../catalogue-ui/pages/form-builder/form-builder.component";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {AuthenticationGuardService} from "./services/authentication-guard.service";

const observatoryUiRoutes: Routes = [

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
  }
]

@NgModule({
  imports: [RouterModule.forChild(observatoryUiRoutes)],
  exports: [RouterModule]
})

export class SurveyToolRoutingModule { }
