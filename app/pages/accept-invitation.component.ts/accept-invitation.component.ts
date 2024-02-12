import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {SurveyService} from "../../services/survey.service";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";


@Component({
  selector: 'app-accept-invitation',
  templateUrl: 'accept-invitation.component.html'
})

export class AcceptInvitationComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();
  token: string = null;
  loading: boolean = false;
  message: string = 'You are being registered';
  error: string = null;

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService,
              private surveyService: SurveyService, private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.loading = true
    this.route.params.pipe(takeUntil(this._destroyed)).subscribe( params => {
      this.token = params['invitationToken'];
      if (this.token) {
        // if (!this.authenticationService.authenticated)
        //   this.authenticationService.tryLogin();
        // else
          this.surveyService.acceptInvitation(this.token).pipe(takeUntil(this._destroyed)).subscribe({
            error: err => {
              this.message = 'Something went wrong, server replied: ';
              this.error = err;
              this.loading = false;
              console.error(err);
            },
            complete: () => {
              this.loading = false;
              this.userService.updateUserInfo();
              this.router.navigate(['/']);
            }
          });
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy() {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

}
