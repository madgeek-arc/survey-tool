import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {HomeComponent} from "../../app/pages/home/home.component";
import {CatalogueUiModule} from "../catalogue-ui/catalogue-ui.module";
import {SurveyFormComponent} from "./pages/contributions-dashboard/my-surveys/survey-form/survey-form.component";
import {ContributionsDashboardComponent} from "./pages/contributions-dashboard/contributions-dashboard.component";
import {ReusableComponentsModule} from "./shared/reusablecomponents/reusable-components.module";
import {AuthenticationService} from "./services/authentication.service";
import {SurveyService} from "./services/survey.service";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {SurveyToolRoutingModule} from "./survey-tool-routing.module";
import {SharedModule} from "../../app/shared/shared.module";
import {UserProfileComponent} from "./pages/user-profile/user-profile.component";
import {CatalogueUiSharedModule} from "../catalogue-ui/shared/catalogue-ui-shared.module";
import {
  CatalogueUiReusableComponentsModule
} from "../catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module";

@NgModule({
  declarations: [
    HomeComponent,
    SurveyFormComponent,
    ContributionsDashboardComponent,
    AcceptInvitationComponent,
    UserProfileComponent,
  ],
  imports: [
    CommonModule,
    CatalogueUiModule,
    ReusableComponentsModule,
    CatalogueUiReusableComponentsModule,
    FormsModule,
    SurveyToolRoutingModule,
    SharedModule,
    CatalogueUiSharedModule,
  ],
  providers: [
    AuthenticationService,
    // AuthGuard,
    SurveyService
  ],
  exports: [
    ContributionsDashboardComponent,
    SurveyFormComponent,
    CatalogueUiReusableComponentsModule
  ]
})
export class SurveyToolModule {
}
