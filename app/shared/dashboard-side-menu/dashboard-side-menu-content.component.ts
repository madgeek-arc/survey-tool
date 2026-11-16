import { Component, ChangeDetectionStrategy, inject, input } from "@angular/core";
import { DashboardSideMenuService } from "./dashboard-side-menu.service";


@Component({
  selector: '[sidebar-content]',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (collapsible()) {
      <div id="sidebar_toggle" (click)="toggleOpen()"></div>
    }
    <div id="sidebar_content" (mouseenter)="onMouseEnter()" (mouseleave)="onMouseLeave()">
      <ng-content></ng-content>
    </div>
    `
})
export class DashboardSideMenuContentComponent {

  collapsible = input(true);

  private layoutService = inject(DashboardSideMenuService);

  onMouseEnter() {
    this.layoutService.setHover(true);
  }

  onMouseLeave() {
    this.layoutService.setHover(false);
  }

  public toggleOpen() {
    this.layoutService.setOpen(!this.layoutService.open);
  }
}
