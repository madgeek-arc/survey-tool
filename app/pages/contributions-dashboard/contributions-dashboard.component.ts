import {Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {UserInfo} from "../../domain/userInfo";
import {ActivatedRoute, NavigationEnd, Router, RoutesRecognized} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";
import {Subscriber} from "rxjs";


@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
})

export class ContributionsDashboardComponent implements OnInit, OnDestroy{

  subscriptions = [];
  open: boolean = true;
  userInfo: UserInfo;

  constructor(public userService: UserService,
              public authentication: AuthenticationService,
              public router: Router,
              public route: ActivatedRoute) {
    this.subscriptions.push(
      this.userService.getUserInfo().subscribe(
        res => {
          this.userService.setUserInfo(res);
          this.userInfo = res;
          this.userService.userId = this.userInfo.user.email;
        }, error => {
          console.error(error);
        },
        () => {
          this.setGroup();
        }
      )
    );

    this.findChildRouteData();

  }

  ngOnInit() {
    this.router.events.subscribe(
      event => {
        if (event instanceof NavigationEnd) {
         this.findChildRouteData();
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  setGroup() {
    this.subscriptions.push(
      this.route.children[0].params.subscribe(params => {
        let groupId = params['id'];
        if (this.userInfo.stakeholders.length) {
          for (const stakeholder of this.userInfo.stakeholders) {
            if (groupId === stakeholder.id){
              console.log(stakeholder);
              this.userService.changeCurrentStakeholder(stakeholder);
              break;
            }
          }
        }
        if (this.userInfo.coordinators.length) {
          for (const coordinator of this.userInfo.coordinators) {
            if (groupId === coordinator.id) {
              this.userService.changeCurrentCoordinator(coordinator);
              break;
            }
          }
        }
      })
    );
  }

  findChildRouteData() {
    let child = this.route.firstChild;
    while (child) {
      if (child.firstChild) {
        child = child.firstChild;
      } else if (child.snapshot.data && child.snapshot.data['showSideMenu'] !== undefined) {
        this.open = child.snapshot.data['showSideMenu'];
        return null;
      } else {
        return null;
      }
    }
  }
}
