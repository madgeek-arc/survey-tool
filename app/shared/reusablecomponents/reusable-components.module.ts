import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ForbiddenPageComponent } from './403-forbidden-page.component';
import { SideMenuDashboardComponent } from "../sidemenudashboard/side-menu-dashboard.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  declarations: [
    SideMenuDashboardComponent,
    ForbiddenPageComponent,
  ],
  exports: [
    SideMenuDashboardComponent,
    ForbiddenPageComponent,
  ],
  providers: [],
})

export class ReusableComponentsModule {
}
