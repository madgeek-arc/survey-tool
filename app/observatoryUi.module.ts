import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {HomeComponent} from "./pages/home.component";
import {CatalogueUiModule} from "../catalogue-ui/catalogue-ui.module";
import {SurveyFormComponent} from "./pages/contributions-dashboard/my-surveys/survey-form/survey-form.component";
import {DynamicFormModule} from "../catalogue-ui/pages/dynamic-form/dynamic-form.module";
import {ContributionsDashboardComponent} from "./pages/contributions-dashboard/contributions-dashboard.component";
import {ReusableComponentsModule} from "./shared/reusablecomponents/reusable-components.module";
import {UserService} from "./services/user.service";
import {AuthenticationService} from "./services/authentication.service";
import {AuthenticationGuardService} from "./services/authentication-guard.service";
import {SurveyService} from "./services/survey.service";
import {HttpInterceptorService} from "./services/http-interceptor.service";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {NationalContributionsToEOSCGuardService} from "./services/nationalContributionsToEOSC-guard.service";
import {ArchiveGuardService} from "./services/archiveGuard.service";
import {TopMenuPublicDashboardComponent} from "./shared/top-menu/topmenupublicdashboard/top-menu-public-dashboard.component";
import {FooterComponent} from "./shared/footer/footer.component";
import {TopMenuLandingComponent} from "./shared/top-menu/topmenulanding/top-menu-landing.component";
import {ObservatoryUiRoutingModule} from "./observatoryUi-routing.module";

@NgModule({
  declarations: [
    HomeComponent,
    SurveyFormComponent,
    ContributionsDashboardComponent,
    AcceptInvitationComponent,
    // NationalContributionsToEOSCDashboardComponent
  ],
  imports: [
    CommonModule,
    CatalogueUiModule,
    DynamicFormModule,
    ReusableComponentsModule,
    FormsModule,
    ObservatoryUiRoutingModule,
  ],
  providers: [
    AuthenticationService,
    AuthenticationGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    NationalContributionsToEOSCGuardService,
    ArchiveGuardService,
    // UserService,
    SurveyService
  ],
  exports: [
    ContributionsDashboardComponent,
    TopMenuPublicDashboardComponent,
    TopMenuLandingComponent,
    FooterComponent,
  ]
})
export class ObservatoryUiModule {
}
