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
import {AuthenticationService} from "./services/authentication.service";
import {AuthenticationGuardService} from "./services/authentication-guard.service";
import {SurveyService} from "./services/survey.service";
import {HttpInterceptorService} from "./services/http-interceptor.service";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {NationalContributionsToEOSCGuardService} from "./services/nationalContributionsToEOSC-guard.service";
import {ArchiveGuardService} from "./services/archiveGuard.service";
import {ObservatoryUiRoutingModule} from "./observatoryUi-routing.module";
import {SharedModule} from "../../app/pages/shared/shared.module";

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
    DynamicFormModule,
    ReusableComponentsModule,
    FormsModule,
    ObservatoryUiRoutingModule,
    SharedModule,
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
    SurveyService
  ],
  exports: [
    ContributionsDashboardComponent,
  ]
})
export class ObservatoryUiModule {
}
