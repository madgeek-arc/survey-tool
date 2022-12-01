import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {HomeComponent} from "../../app/pages/home/home.component";
import {CatalogueUiModule} from "../catalogue-ui/catalogue-ui.module";
import {SurveyFormComponent} from "./pages/contributions-dashboard/my-surveys/survey-form/survey-form.component";
import {ContributionsDashboardComponent} from "./pages/contributions-dashboard/contributions-dashboard.component";
import {ReusableComponentsModule} from "./shared/reusablecomponents/reusable-components.module";
import {AuthenticationService} from "./services/authentication.service";
import {AuthenticationGuardService} from "./services/authentication-guard.service";
import {SurveyService} from "./services/survey.service";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {ObservatoryUiRoutingModule} from "./observatoryUi-routing.module";
import {SharedModule} from "../../app/shared/shared.module";

@NgModule({
  declarations: [
    HomeComponent,
    SurveyFormComponent,
    ContributionsDashboardComponent,
    AcceptInvitationComponent
  ],
  imports: [
    CommonModule,
    CatalogueUiModule,
    ReusableComponentsModule,
    FormsModule,
    ObservatoryUiRoutingModule,
    SharedModule,
  ],
  providers: [
    AuthenticationService,
    AuthenticationGuardService,
    SurveyService
  ],
  exports: [
    ContributionsDashboardComponent,
  ]
})
export class ObservatoryUiModule {
}
