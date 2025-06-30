import {Inject, Injectable, NgZone, PLATFORM_ID} from "@angular/core";
import {BehaviorSubject, Observable, Subscriber} from "rxjs";
import { ActivationEnd, ActivationStart, Router } from "@angular/router";
// import {Icon} from "../../../sharedComponents/menu";
import {isPlatformBrowser} from "@angular/common";
import { Icon } from "./dashboard-side-menu.component";
import { filter } from "rxjs/operators";
// import {properties} from "../../../../../environments/environment";

declare var ResizeObserver;

export interface SidebarItem {
  icon?: Icon,
  name: string,
  subItem?: SidebarItem
}

@Injectable({
  providedIn: 'root'
})

export class DashboardSideMenuService {

  public static HEADER_HEIGHT = '80px';
  private deviceBreakpoint: number;

  /**
   * Set this to true when sidebar items are ready.
   */
  private openSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Set this to true when sidebar is hovered, otherwise false.
   */
  private hoverSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   *  Add hasSidebar: false on data of route config, if sidebar is not needed.
   */
  private hasSidebarSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   *  Add hasHeader: false on data of route config, if header is not needed.
   */
  private hasHeaderSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   *  Add hasAdminMenu: true on data of route config, if global sidebar should be used.
   */
  private hasAdminMenuSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   *  Add hasInternalSidebar: true on data of route config, if internal sidebar should be used.
   */
  private hasInternalSidebarSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   *  Add isFrontPage: true on data of route config, if current route is for front page.
   */
  private isFrontPageSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   *  Add isSmallScreen: true on data of route config, if screen is small.
   *  @deprecated
   */
  private isSmallScreenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   *  Add hasQuickContact: false on data of route config, if the quick-contact fixed button is not needed.
   */
  private hasQuickContactSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   *  Add activeMenuItem: string on data of route config, if page should activate a specific MenuItem and route url does not match.
   */

  private activeMenuItemSubject: BehaviorSubject<string> = new BehaviorSubject<string>("");

  /**
   *  Change to true will replace your Nav Header with the replaceHeader of your object.
   *  Be sure that replaceHeader exists.
   */
  private replaceHeaderSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /** Check if the current device is mobile or tablet */
  private isMobileSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /** Active sidebar Item*/
  private activeSidebarItemSubject: BehaviorSubject<SidebarItem> = new BehaviorSubject<SidebarItem>(null);
  /**
   *  Add hasMenuSearchBar: false/ nothing on data of route config, if the search bar in the menu should not appear, otherwise true.
   */
  private hasMenuSearchBarSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Add hasStickyHeaderOnMobile: true in order to activate uk-sticky in header of mobile/tablet devices.
   * */
  private hasStickyHeaderOnMobileSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Add isEmbeddedPageSubject: true in order to create a page to be embedded as iframe.
   * */
  private isEmbeddedPageSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Add a class in root element of the html. (For different theme apply)
   * Handle it manually in the component, it doesn't use data
   * */
  private rootClassSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  /**
   * Display help pop-up on non-admin pages. (default true for the rest of the pages)
   * */
  private hasHelpPopUpSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private isBottomIntersectingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private showChartsSubject: BehaviorSubject<boolean>;
  private subscriptions: any[] = [];

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  clearSubscriptions() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      } else if (typeof ResizeObserver !== "undefined" && subscription instanceof ResizeObserver) {
        subscription.disconnect();
      }
    })
  }

  setObserver() {
    if (typeof ResizeObserver !== "undefined" && typeof document !== "undefined") {
      this.deviceBreakpoint = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--uk-breakpoint-m').replace('px', '')) + 1;
      let resizeObs = new ResizeObserver(entries => {
        entries.forEach(entry => {
          this.isMobileSubject.next(entry.target.clientWidth < this.deviceBreakpoint);
        });
      });
      this.subscriptions.push(resizeObs);
      resizeObs.observe(document.documentElement);
    }
    if(typeof document !== "undefined") {
      setTimeout(() => {
        let bottom = document.getElementById('bottom');
        if (bottom) {
          let bottomObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              this.isBottomIntersectingSubject.next(entry.isIntersecting);
            })
          });
          this.subscriptions.push(bottomObs);
          bottomObs.observe(bottom);
        }
      }, 500)
    }
  }

  // setShowCharts() {
  //   if(isPlatformBrowser(this.platformId) && !properties.disableFrameLoad) {
  //     this.showChartsSubject = new BehaviorSubject<boolean>(!document.hidden);
  //     document.addEventListener('visibilitychange', () => {
  //       this.ngZone.run(() => {
  //         this.showChartsSubject.next(!document.hidden);
  //       });
  //     });
  //   } else {
  //     this.showChartsSubject = new BehaviorSubject<boolean>(false);
  //   }
  // }

  constructor(private router: Router, private ngZone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) {
    if (typeof window !== 'undefined') {
      this.isMobileSubject.next(window.innerWidth < this.deviceBreakpoint);
    }
    this.subscriptions.push(this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      filter((event: ActivationEnd) => event.snapshot.firstChild === null) // only leaf routes
    ).subscribe(event => {
      this.setReplaceHeader(false);
      let data = event.snapshot.data;
      if (data['hasSidebar'] !== undefined && data['hasSidebar'] === false) {
        this.setHasSidebar(false);
      } else {
        this.setHasSidebar(true);
      }
      if (data['hasHeader'] !== undefined &&
        data['hasHeader'] === false) {
        this.setHasHeader(false);
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty('--header-height', '0px');
        }
      } else {
        this.setHasHeader(true);
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty('--header-height', DashboardSideMenuService.HEADER_HEIGHT);
        }
      }
      if (data['hasAdminMenu'] !== undefined &&
        data['hasAdminMenu'] === true) {
        this.setHasAdminMenu(true);
      } else {
        this.setHasAdminMenu(false);
      }
      if (data['hasInternalSidebar'] !== undefined &&
        data['hasInternalSidebar'] === true) {
        this.setHasInternalSidebar(true);
      } else {
        this.setHasInternalSidebar(false);
      }
      if (data['isFrontPage'] !== undefined &&
        data['isFrontPage'] === true) {
        this.setFrontPage(true);
      } else {
        this.setFrontPage(false);
      }
      if (data['isSmallScreen'] !== undefined &&
        data['isSmallScreen'] === true) {
        this.setSmallScreen(true);
      } else {
        this.setSmallScreen(false);
      }
      if (data['hasQuickContact'] !== undefined &&
        data['hasQuickContact'] === false) {
        this.setHasQuickContact(false);
      } else {
        this.setHasQuickContact(true);
      }
      if (data['activeMenuItem'] !== undefined &&
        data['activeMenuItem'] !== null) {
        this.setActiveMenuItem(data['activeMenuItem']);
      } else {
        this.setActiveMenuItem('');
      }
      if (data['hasMenuSearchBar'] !== undefined &&
        data['hasMenuSearchBar'] === true) {
        this.setHasMenuSearchBar(true);
      } else {
        this.setHasMenuSearchBar(false);
      }
      if (data['hasStickyHeaderOnMobile'] !== undefined &&
        data['hasStickyHeaderOnMobile'] === true) {
        this.setHasStickyHeaderOnMobile(true);
      } else {
        this.setHasStickyHeaderOnMobile(false);
      }
      if (data['isEmbeddedPage'] !== undefined &&
        data['isEmbeddedPage'] === true) {
        this.setEmbeddedPage(true);
      } else {
        this.setEmbeddedPage(false);
      }
    }));
    this.setObserver();
    // this.setShowCharts();
  }

  get isOpen(): Observable<boolean> {
    return this.openSubject.asObservable();
  }

  get open(): boolean {
    return this.openSubject.getValue();
  }

  setOpen(value: boolean) {
    this.openSubject.next(value);
  }

  get hover(): boolean {
    return this.hoverSubject.getValue();
  }

  setHover(value: boolean) {
    this.hoverSubject.next(value);
  }

  get hasAnySidebar(): boolean {
    return this.hasSidebarSubject.getValue() || this.hasInternalSidebarSubject.getValue() || this.hasAdminMenuSubject.getValue();
  }

  get hasSidebar(): Observable<boolean> {
    return this.hasSidebarSubject.asObservable();
  }

  setHasSidebar(value: boolean) {
    this.hasSidebarSubject.next(value);
  }

  get hasHeader(): Observable<boolean> {
    return this.hasHeaderSubject.asObservable();
  }

  setHasHeader(value: boolean) {
    this.hasHeaderSubject.next(value);
  }

  get hasAdminMenu(): Observable<boolean> {
    return this.hasAdminMenuSubject.asObservable();
  }

  setHasAdminMenu(value: boolean) {
    this.hasAdminMenuSubject.next(value);
  }

  get hasInternalSidebar(): Observable<boolean> {
    return this.hasInternalSidebarSubject.asObservable();
  }

  setHasInternalSidebar(value: boolean) {
    this.hasInternalSidebarSubject.next(value);
  }

  get isFrontPage(): Observable<boolean> {
    return this.isFrontPageSubject.asObservable();
  }

  setFrontPage(value: boolean) {
    this.isFrontPageSubject.next(value);
  }

  get replaceHeader(): Observable<boolean> {
    return this.replaceHeaderSubject.asObservable();
  }

  get replaceHeaderValue(): boolean {
    return this.replaceHeaderSubject.getValue();
  }

  setReplaceHeader(value: boolean) {
    this.replaceHeaderSubject.next(value);
  }

  /**
   * @deprecated
   * */
  get isSmallScreen(): boolean {
    return this.isSmallScreenSubject.getValue();
  }

  /**
   * @deprecated
   * */
  setSmallScreen(value: boolean) {
    this.isSmallScreenSubject.next(value);
  }

  get hasQuickContact(): Observable<boolean> {
    return this.hasQuickContactSubject.asObservable();
  }

  setHasQuickContact(value: boolean) {
    this.hasQuickContactSubject.next(value);
  }

  get activeMenuItem(): string {
    return this.activeMenuItemSubject.getValue();
  }

  setActiveMenuItem(value: string) {
    this.activeMenuItemSubject.next(value);
  }

  get isMobile(): Observable<boolean> {
    return this.isMobileSubject.asObservable();
  }

  get isMobileValue(): boolean {
    return this.isMobileSubject.getValue();
  }

  get activeSidebarItem(): Observable<SidebarItem> {
    return this.activeSidebarItemSubject.asObservable();
  }

  setActiveSidebarItem(value: SidebarItem) {
    this.activeSidebarItemSubject.next(value);
  }

  get hasMenuSearchBar(): Observable<boolean> {
    return this.hasMenuSearchBarSubject.asObservable();
  }

  setHasMenuSearchBar(value: boolean) {
    this.hasMenuSearchBarSubject.next(value);
  }

  get hasStickyHeaderOnMobile(): Observable<boolean> {
    return this.hasStickyHeaderOnMobileSubject.asObservable();
  }

  setHasStickyHeaderOnMobile(value: boolean) {
    this.hasStickyHeaderOnMobileSubject.next(value);
  }
  get isEmbeddedPage(): Observable<boolean> {
    return this.isEmbeddedPageSubject.asObservable();
  }

  setEmbeddedPage(value: boolean) {
    this.isEmbeddedPageSubject.next(value);
  }

  get rootClass(): Observable<string> {
    return this.rootClassSubject.asObservable();
  }

  setRootClass(value: string = null): void {
    if(this.rootClassSubject.value != value) {
      this.rootClassSubject.next(value);
    }
  }

  get hasHelpPopUp(): Observable<boolean> {
    return this.hasHelpPopUpSubject.asObservable();
  }

  setHasHelpPopUp(value: boolean) {
    this.hasHelpPopUpSubject.next(value);
  }

  get isBottomIntersecting(): Observable<boolean> {
    return this.isBottomIntersectingSubject.asObservable();
  }

  // get showCharts(): Observable<boolean> {
  //   return this.showChartsSubject.asObservable();
  // }
}
