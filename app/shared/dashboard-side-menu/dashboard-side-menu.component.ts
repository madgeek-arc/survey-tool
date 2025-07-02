import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit, Output,
  PLATFORM_ID, QueryList,
  SimpleChanges,
  ViewChild, ViewChildren
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, QueryParamsHandling, Router, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { DashboardSideMenuService } from "./dashboard-side-menu.service";
import { DashboardSideMenuContentComponent } from "./dashboard-side-menu-content.component";
import { IconsComponent } from "../../utils/icons/icons.component";


declare var UIkit;

export interface Icon {
  name?: string,
  svg?: string,
  class?: string,
  ratio?: number
}

export class MenuItem {
  _id: string = ""; // for the root menu to close the dropdown when clicked
  title: string = "";
  // type: string = "internal";
  url: string = ""; // external url
  route: string = ""; // internal url - using angular routing and components
  routeActive: string = ""; // route to check if it is active
  // needsAuthorization: boolean = false; // needs admin rights - mainly for users' menu at this point
  // entitiesRequired: string[] = []; // openaire entities used in page "publication, dataset, organisation, software, project, datasource"
  // routeRequired: string[] = []; // the routes that if aren't enabled the menu item don't make sense
  params: any = {};
  fragment: string | null;
  items: MenuItem[] = [];
  icon: Icon;
  open: boolean;
  customClass: string = null;
  // isFeatured: boolean;
  isActive: boolean;
  target: string = "_blank";
  // badge?: string = ""; // used only for RDGraph portal (FAIRCORE4EOSC)

  constructor(id: string, title: string, url: string, route: string, routeActive: string, icon: Icon = null,
              fragment: string | null = null, customClass = null, items: MenuItem[] = []) {
    this._id = id;
    this.title = title;
    this.url = url;
    this.route = route;
    this.routeActive = routeActive;
    // this.needsAuthorization = needsAuthorization;
    // this.entitiesRequired = entitiesRequired;
    // this.routeRequired = routeRequired;
    // this.params = params;
    this.items = items;
    this.icon = icon;
    this.fragment = fragment;
    this.customClass = customClass;
    // this.target = target;
    // this.type = type;
    // this.isFeatured = isFeatured;
    // this.badge = badge;
  }

  public static isTheActiveMenu(menu: MenuItem, currentRoute: any, activeMenuItem: string = ""): boolean {
    if (menu.route && menu.route.length > 0 && MenuItem.isTheActiveMenuItem(menu, currentRoute, activeMenuItem)) {
      return true;
    } else if (menu.items.length > 0) {
      for (let menuItem of menu.items) {
        if (MenuItem.isTheActiveMenuItem(menuItem, currentRoute, activeMenuItem)) {
          return true;
        }
      }
    }
    return false;
  }

  private static isTheActiveMenuItem(menu: MenuItem, currentRoute: any, activeMenuItem: string) {
    return (((menu.route == currentRoute.route || menu.route == (currentRoute.route + "/")) && currentRoute.fragment == menu.fragment))
      || (menu.routeActive && (currentRoute.route.startsWith(menu.routeActive)))
      || (menu._id && menu._id === activeMenuItem);
  }

}

export interface MenuSections {
  items: MenuItem[],
  customClass?: string,
}
// interface SidebarItem {
//   icon?: string,
//   name: string,
//   subItem?: SidebarItem
// }

@Component({
  selector: 'dashboard-sidebar',
  standalone: true,
  templateUrl: 'dashboard-side-menu.component.html',
  imports: [
    CommonModule,
    RouterLink,
    DashboardSideMenuContentComponent,
    IconsComponent
  ]
})

export class DashboardSideMenuComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() menuSections: MenuSections[] = [];
  // @Input() items: MenuItem[] = [];
  @Input() activeItem: string = '';
  @Input() activeSubItem: string = '';
  @Input() backItem: MenuItem = null;
  @Input() queryParamsHandling: QueryParamsHandling;
  @Input() logoURL: string;
  @Output() hoverChange = new EventEmitter<boolean>();
  // @ViewChild("nav") nav: ElementRef;
  @ViewChildren("nav") nav: QueryList<ElementRef>;
  @ViewChild("sidebar_offcanvas") sidebar_offcanvas: ElementRef;
  public offset: number;
  // public properties = properties;
  private subscriptions: any[] = [];
  private init: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private layoutService: DashboardSideMenuService,
              private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId) {
    this.subscriptions.push(this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && (!this.activeItem && !this.activeSubItem)) {
        this.setActiveMenuItem();
      }
    }));
  }

  ngOnInit() {
    if (typeof document !== "undefined") {
      this.offset = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
    }
    this.setActiveMenuItem();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.toggle(true);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.activeItem || changes.activeSubItem || changes.menuSections) {
      this.setActiveMenuItem();
      if(this.init && changes.menuSections) {
        this.toggle();
      }
    }
  }

  ngOnDestroy() {
    this.layoutService.setActiveSidebarItem(null);
    this.subscriptions.forEach(subscription => {
      if(subscription instanceof Subscription) {
        subscription.unsubscribe();
      }
    });
  }

  toggle(init: boolean = false) {
    this.init = this.init || init;
    const activePos = this.activeItemPosition || null;
    if (this.nav && typeof UIkit !== "undefined" && activePos != null) {
      setTimeout(() => {
        if(this.menuSections[activePos.sectionIndex].items[activePos.itemIndex]?.items?.length > 0) {
          UIkit.nav(this.nav.toArray()[activePos.sectionIndex].nativeElement).toggle(activePos.itemIndex, true);
          // nav: QueryList<ElementRef> also includes hidden / not visible nav Elements (sidebar exists twice).
          // so to work for both mobile and desktop, toggle at both Elements
          UIkit.nav(this.nav.toArray()[activePos.sectionIndex + this.nav.toArray().length/2].nativeElement).toggle(activePos.itemIndex, true);
        }
      });
    }
  }

  get isBrowser() {
    return this.platformId === 'browser';
  }

  get currentRoute() {
    return {
      route: this.router.url.split('?')[0].split('#')[0],
      fragment: this.route.snapshot.fragment
    }
  }

  get activeItemPosition(): { sectionIndex: number; itemIndex: number } | null {
    for (let sectionIndex = 0; sectionIndex < this.menuSections.length; sectionIndex++) {
      const section = this.menuSections[sectionIndex];
      const itemIndex = section.items.findIndex(item => item.isActive);
      if (itemIndex !== -1) {
        return { sectionIndex, itemIndex };
      }
    }
    return null; // no active item found
  }

  // get activeIndex(): number {
  //   return this.items ? this.items.findIndex(item => item.isActive) : 0;
  // }

  getItemRoute(item: MenuItem) {
    if(this.activeSubItem && item.items.length > 0) {
      let subItem = item.items.find(subItem => subItem._id === this.activeSubItem);
      return subItem?subItem.route:(item.route?item.route:null);
    } else {
      return item.route?item.route:null;
    }
  }

  setActiveMenuItem() {
    this.menuSections.forEach(section => {
      section.items.forEach(item => {
        item.isActive = this.isTheActiveMenuItem(item);

        if (item.isActive) {
          if (item.items?.length > 0) {
            item.items.forEach(subItem => {
              subItem.isActive = this.isTheActiveMenuItem(item, subItem);
              if (subItem.isActive) {
                this.layoutService.setActiveSidebarItem({
                  name: item.title,
                  icon: item.icon,
                  subItem: {
                    name: subItem.title
                  }
                });
              }
            });
          } else {
            this.layoutService.setActiveSidebarItem({
              name: item.title,
              icon: item.icon
            });
          }
        } else {
          item.items?.forEach(subItem => {
            subItem.isActive = false;
          });
        }
      });
    });

    if (this.hasNoActiveMenuItems(this.menuSections)) {
      this.layoutService.setActiveSidebarItem(null);
    }
    this.cdr.detectChanges();
  }

  hasNoActiveMenuItems(sections: MenuSections[]): boolean {
    return !sections.some(section => section.items.some(item => item.isActive));
  }

  private isTheActiveMenuItem(item: MenuItem, subItem: MenuItem = null): boolean {
    if (this.activeItem || this.activeSubItem) {
      return (!subItem && this.activeItem === item._id) || (subItem && this.activeItem === item._id && this.activeSubItem === subItem._id);
    } else {
      if (subItem) {
        return MenuItem.isTheActiveMenu(subItem, this.currentRoute);
      }
      return MenuItem.isTheActiveMenu(item, this.currentRoute);
    }
  }

  public get open() {
    return this.layoutService.open;
  }

  public closeOffcanvas() {
    if(this.sidebar_offcanvas) {
      UIkit.offcanvas(this.sidebar_offcanvas.nativeElement).hide();
    }
  }

  onMouseEnter() {
    this.hoverChange.emit(true);
  }

  onMouseLeave() {
    this.hoverChange.emit(false);
  }
}

