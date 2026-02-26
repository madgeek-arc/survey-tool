import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormBuilderComponent } from "../catalogue-ui/pages/form-builder/form-builder.component";
import { AcceptInvitationComponent } from "./pages/accept-invitation.component.ts/accept-invitation.component";
import { AuthGuard } from "./services/auth-guard.service";
import { UserProfileComponent } from "./pages/user-profile/user-profile.component";
import { FormsListComponent } from "../catalogue-ui/pages/forms-list/forms-list.component";

const observatoryUiRoutes: Routes = [

  {
    path: 'fb',
    component: FormsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'fb/new-form',
    component: FormBuilderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'fb/:id/edit',
    component: FormBuilderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'invitation/accept/:invitationToken',
    component: AcceptInvitationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contributions/:id',
    loadChildren: () => import('./pages/contributions-dashboard/contributions-dashboard.module').then(m => m.ContributionsDashboardModule),
  },
  {
    path: 'profile',
    component: UserProfileComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(observatoryUiRoutes)],
  exports: [RouterModule]
})

export class SurveyToolRoutingModule { }
