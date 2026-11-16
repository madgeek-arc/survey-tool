import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SurveyService } from "../../services/survey.service";
import { UserService } from "../../services/user.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";


@Component({
    selector: 'app-accept-invitation',
    templateUrl: 'accept-invitation.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AcceptInvitationComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();
  token: string = null;
  loading = signal(false);
  message = signal('You are being registered');
  error = signal<string | null>(null);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private surveyService = inject(SurveyService);

  ngOnInit() {
    this.loading.set(true);
    this.route.params.pipe(takeUntil(this._destroyed)).subscribe( params => {
      this.token = params['invitationToken'];
      if (this.token) {
        this.surveyService.acceptInvitation(this.token).pipe(takeUntil(this._destroyed)).subscribe({
          error: err => {
            this.message.set('Something went wrong, server replied: ');
            this.error.set(err.message);
            this.loading.set(false);
            console.error(err);
          },
          complete: () => {
            this.loading.set(false);
            this.userService.updateUserInfo();
            this.router.navigate(['/']).then();
          }
        });
      } else {
        this.router.navigate(['/']).then();
      }
    });
  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

}
