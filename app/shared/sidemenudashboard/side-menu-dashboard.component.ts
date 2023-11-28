import {Component, OnDestroy, OnInit} from "@angular/core";
import {Coordinator, Stakeholder, UserInfo} from "../../domain/userInfo";
import {UserService} from "../../services/user.service";
import {Subject, Subscriber} from "rxjs";
import {environment} from "../../../environments/environment";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-side-menu-dashboard',
  templateUrl: 'side-menu-dashboard.component.html',
})

export class SideMenuDashboardComponent implements OnInit, OnDestroy {

  private _destroyed: Subject<boolean> = new Subject();
  subscriptions = [];
  projectName: string = environment.projectName;
  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  ready = false;
  isManager = false;

  constructor(private userService: UserService) {
  }

  ngOnInit() {

    this.userService.currentStakeholder.pipe(takeUntil(this._destroyed)).subscribe(next => {
      this.currentStakeholder = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
      if (this.currentStakeholder !== null) {
        this.ready = true;
        this.isManager = this.checkIfManager();
      }
    });
    this.userService.currentCoordinator.pipe(takeUntil(this._destroyed)).subscribe(next => {
      this.currentCoordinator = !!next ? next : JSON.parse(sessionStorage.getItem('currentCoordinator'));
      if (this.currentCoordinator !== null) {
        this.ready = true;
      }
    });

  }


  checkIfManager(): boolean {
    if (this.currentStakeholder) {
      let userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
      for (const manager of this.currentStakeholder.admins) {
        if (userInfo.user.email === manager){
          return true;
        }
      }
      return false;
    }
    return false;
  }

  toggleSidebar() {
    const el: HTMLElement = document.getElementById('sidebar_toggle');
    if(!el.classList.contains('closed')) {
      el.classList.add('closed');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.remove('sidebar_main_active');
      el1.classList.add('sidebar_main_inactive');
    } else {
      el.classList.remove('closed');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.add('sidebar_main_active');
      el1.classList.remove('sidebar_main_inactive');
    }
  }

  ngOnDestroy() {

    this._destroyed.next(true);
    this._destroyed.complete();
  }

}
