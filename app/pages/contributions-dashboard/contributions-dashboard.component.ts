import { ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { Administrator, Coordinator, Stakeholder, UserInfo } from "../../domain/userInfo";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Subscriber } from "rxjs";
import {
  DashboardSideMenuComponent,
  MenuItem,
  MenuSection
} from "../../shared/dashboard-side-menu/dashboard-side-menu.component";

import { SharedModule } from "../../../../app/shared/shared.module";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DashboardSideMenuService } from "../../shared/dashboard-side-menu/dashboard-side-menu.service";


@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    DashboardSideMenuComponent,
    SharedModule
]
})

export class ContributionsDashboardComponent implements OnInit, OnDestroy{

  private destroyRef = inject(DestroyRef);
  protected cdr: ChangeDetectorRef;

  subscriptions = [];
  showFooter: boolean = true;

  userInfo: UserInfo;
  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  currentAdministrator: Administrator = null;
  isManager = false;

  menuItems: MenuItem[] = [];
  menuSections: MenuSection[] = [];
  hasSidebar = true;
  hasAdminMenu = false;


  constructor(public userService: UserService, public router: Router, public route: ActivatedRoute,
              private layoutService: DashboardSideMenuService) {
    this.userService.getUserInfo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.userService.setUserInfo(res);
        this.userInfo = res;
        this.userService.userId = this.userInfo.user.email;
        this.setGroup();
      }, error => {
        console.error(error);
      }
    );

    this.findChildRouteData();

  }

  ngOnInit() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      event => {
        if (event instanceof NavigationEnd) {
         this.findChildRouteData();
        }
      }
    );

    this.userService.currentStakeholder.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      const stakeholderChange = next?.id !== this.currentStakeholder?.id;
      this.currentStakeholder = next ?? JSON.parse(sessionStorage.getItem('currentStakeholder'));
      if (this.currentStakeholder !== null) {
        // console.log('Current stakeholder change: ', this.currentStakeholder);
        if (stakeholderChange || this.menuSections.length === 0) {
          this.createMenuItems();
        }
        this.userService.getUserObservable().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: value => {
            if (value)
              this.isManager = this.checkIfManager();
          }
        });
      }
    });
    this.userService.currentCoordinator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      const coordinatorChange = next?.id !== this.currentCoordinator?.id;
      this.currentCoordinator = next ?? JSON.parse(sessionStorage.getItem('currentCoordinator'));
      if (this.currentCoordinator !== null) {
        // console.log('Current coordinator change: ', this.currentCoordinator);
        if (coordinatorChange || this.menuSections.length === 0) {
          this.createMenuItems();
        }
      }
    });
    this.userService.currentAdministrator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      const adminChange = next?.id !== this.currentAdministrator?.id;
      this.currentAdministrator = next ?? JSON.parse(sessionStorage.getItem('currentAdministrator'));
      if (this.currentAdministrator !== null) {
        // console.log('Current Administrator change: ', this.currentAdministrator);
        if (adminChange || this.menuSections.length === 0) {
          this.createMenuItems();
        }
      }
    });

    this.layoutService.hasSidebar.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(hasSidebar => {
      this.hasSidebar = hasSidebar;
    });

    this.layoutService.setOpen(true);
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
              // console.log(stakeholder);
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

    this.showFooter = true;

    let child = this.route.firstChild;
    while (child) {
      if (child.firstChild) {
        child = child.firstChild;
      } else if (child.snapshot.data) {
        if (child.snapshot.data['showFooter'] !== undefined)
          this.showFooter = child.snapshot.data['showFooter'];
        return null;
      } else {
        return null;
      }
    }
  }

  checkIfManager(): boolean {
    if (this.currentStakeholder) {
      let userInfo = this.userService.getCurrentUserInfo();

      for (const manager of this.currentStakeholder.admins) {
        if (userInfo.user.email === manager){
          return true;
        }
      }
      return false;
    }
    return false;
  }

  createMenuItems() {

    // console.log('Administrator object', this.currentAdministrator);
    // console.log('Stakeholder object', this.currentStakeholder);
    // console.log('Coordinator object', this.currentCoordinator);

    setTimeout(() => {
      this.menuSections = [];
      this.menuItems = [];

      this.menuSections.push({
        items: [new MenuItem('0', 'Home', null, '/contributions/' + (this.currentStakeholder?.id ?? this.currentCoordinator?.id ?? this.currentAdministrator?.id) + '/home', '/contributions/' + (this.currentStakeholder?.id ?? this.currentCoordinator?.id ?? this.currentAdministrator?.id) + '/home', {name: 'home'})]
      });
      if (this.currentStakeholder) {
        this.menuSections.push({
          items: [
            new MenuItem('1', 'My Surveys', null, '/contributions/' + this.currentStakeholder?.id + '/mySurveys', null, {name: 'assignment'}),
            new MenuItem('2', 'My Group', null, '/contributions/' + this.currentStakeholder?.id + '/group', null, {name: 'group'}),
            new MenuItem('3', this.currentStakeholder.type.toUpperCase() + ' Surveys', null, '/contributions/' + this.currentStakeholder?.id + '/surveys', null, {name: 'assignment'}),
            new MenuItem('6', 'Messages', null, '/contributions/' + (this.currentStakeholder?.id ?? this.currentCoordinator?.id ?? this.currentAdministrator?.id) + '/messages', null, {name: 'chat'})
          ]
        });
      }
      if (this.currentCoordinator) {
        this.menuSections.push({
          items: [
            new MenuItem('14', 'My Group', null, '/contributions/' + this.currentCoordinator?.id + '/group', null, {name: 'group'}),
            new MenuItem('4', 'Surveys', null, '/contributions/' + this.currentCoordinator?.id + '/surveys', null, {name: 'assignment'}),
            new MenuItem('5', 'Survey Templates', null, '/contributions/' + this.currentCoordinator?.id + '/surveyTemplates', null, {name: 'assignment'}),
            new MenuItem('6', 'Messages', null, '/contributions/' + (this.currentStakeholder?.id ?? this.currentCoordinator?.id ?? this.currentAdministrator?.id) + '/messages', null, {name: 'chat'}),
            new MenuItem('7', 'Stakeholders', null, '/contributions/' + this.currentCoordinator?.id + '/stakeholders', null, {name: 'manage_accounts'}),
          ]
        });
      }

      if (this.currentAdministrator) {

        this.menuItems = [];

        this.menuItems.push(
          new MenuItem('13', 'My Group', null, '/contributions/' + this.currentAdministrator?.id + '/my-group', null, {name: 'group'})
        );

        this.menuItems.push(
          new MenuItem('12', 'User Groups', null, '/contributions/' + this.currentAdministrator?.id + '/coordinators', null, {name: 'manage_accounts'})
        );

        this.menuItems[1].items.push(
          new MenuItem('12-0', 'Coordinators', null, '/contributions/' + this.currentAdministrator?.id + '/coordinators', null, { name: ''})
        );

        this.menuItems[1].items.push(
          new MenuItem('12-1', 'Stakeholders', null, '/contributions/' + this.currentAdministrator?.id + '/stakeholders-admin', null, { name: ''})
        );

        this.menuItems.push(
          new MenuItem('11', 'Resources Registry', null, '/contributions/' + (this.currentAdministrator?.id) + '/resources-registry/search', null, {name: 'manage_accounts'})
        );

        this.menuSections.push({ items: this.menuItems });
      }


      this.menuItems = [];
      this.menuSections.push({
        items: [
          new MenuItem('8', 'Support', 'mailto:stefania.martziou@athenarc.gr', null, null, {name: 'help'}),
          new MenuItem('9', 'Privacy policy', '../assets/pdf/EOSC-SB%20Privacy%20Policy%20V3.0.pdf', null, null, {name: 'policy'}),
          new MenuItem('10', 'Use Policy', '../assets/pdf/EOSC%20Observatory%20Acceptable%20Use%20Policy%20V2.pdf', null, null, {name: 'policy'})
        ]
      });

    }, 0);

  }


  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }
}
