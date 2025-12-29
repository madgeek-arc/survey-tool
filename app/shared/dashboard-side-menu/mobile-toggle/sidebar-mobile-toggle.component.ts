import { Component, OnDestroy, OnInit } from "@angular/core";

import { DashboardSideMenuService, SidebarItem } from "../dashboard-side-menu.service";
import { Subscription } from "rxjs";
import { IconsComponent } from "../../icons/icons.component";

@Component({
  imports: [IconsComponent],
  selector: 'sidebar-mobile-toggle',
  standalone: true,
  template: `
    @if (activeSidebarItem) {
      <a href="#sidebar_offcanvas"
        class="sidebar_mobile_toggle uk-link-reset uk-width-3-5 uk-flex uk-flex-middle" uk-toggle>
        @if (activeSidebarItem.icon && (activeSidebarItem.icon.svg || activeSidebarItem.icon.name)) {
          <div
            class="uk-width-auto">
            <icon class="menu-icon" [customClass]="activeSidebarItem.icon.class" [name]="activeSidebarItem.icon.name"
              [ratio]="activeSidebarItem.icon.ratio?activeSidebarItem.icon.ratio:0.8" [svg]="activeSidebarItem.icon.svg"
            [flex]="true"></icon>
          </div>
        }
        <span class="uk-width-expand uk-text-truncate uk-margin-small-left uk-text-bolder">
          {{ activeSidebarItem.name }}
          @if (activeSidebarItem.subItem) {
            <span>- {{ activeSidebarItem.subItem.name }}</span>
          }
        </span>
        <div class="uk-width-auto uk-margin-small-left">
          <icon name="arrow_right" [ratio]=1.4></icon>
        </div>
      </a>
    }
    `
})
export class SidebarMobileToggleComponent implements OnInit, OnDestroy {

  public activeSidebarItem: SidebarItem;
  private subscriptions: any[] = [];

  constructor(private layoutService: DashboardSideMenuService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.layoutService.activeSidebarItem.subscribe(activeSidebarItem => {
      // console.log('activeSidebarItem', activeSidebarItem);
      this.activeSidebarItem = activeSidebarItem;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if(subscription instanceof Subscription) {
        subscription.unsubscribe();
      }
    });
  }

}

