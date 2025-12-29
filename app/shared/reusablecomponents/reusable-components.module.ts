import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ForbiddenPageComponent } from './403-forbidden-page.component';

@NgModule({ declarations: [
        ForbiddenPageComponent,
    ],
    exports: [
        ForbiddenPageComponent,
    ], imports: [CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule], providers: [provideHttpClient(withInterceptorsFromDi())] })

export class ReusableComponentsModule {
}
