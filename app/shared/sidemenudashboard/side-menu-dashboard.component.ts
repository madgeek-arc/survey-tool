import {Component, Input, OnInit, ViewChild} from "@angular/core";
import {Coordinator, Stakeholder} from "../../domain/userInfo";
import {UserService} from "../../services/user.service";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-side-menu-dashboard',
  templateUrl: 'side-menu-dashboard.component.html',
  styleUrls: ['./side-menu-dashboard.component.css']
})

export class SideMenuDashboardComponent implements OnInit {

  subscriptions = [];
  toggle: number[] = [];
  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  ready = false;
  isManager = false;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(next => {
        this.currentStakeholder = next;
        if (this.currentStakeholder !== null) {
          this.ready = true;
          this.isManager = this.checkIfManager();
        }
      })
    );
    this.subscriptions.push(
      this.userService.currentCoordinator.subscribe(next => {
        this.currentCoordinator = next;
        if (this.currentCoordinator !== null) {
          this.ready = true;
        }
      })
    );
  }

  checkIfManager(): boolean {
    if (this.currentStakeholder) {
      for (const manager of this.currentStakeholder.managers) {
        if (this.userService.userInfo.user.email === manager){
          return true;
        }
      }
      return false;
    }
    return false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }



}
