import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from "@angular/core";
import { NgClass } from "@angular/common";
import { DashboardSideMenuService } from "../dashboard-side-menu/dashboard-side-menu.service";

declare var UIkit;

@Component({
  selector: '[page-content]',
  imports: [
    NgClass
  ],
  standalone: true,
  template: `
    <div id="page_content">
      <div [class.uk-hidden]="!isBrowser" id="page_content_sticky_footer" #sticky_footer
           class="uk-tile-default uk-blur-background">
        <div class="uk-container uk-container-large">
          <div [ngClass]="!isMobile?'uk-padding-small uk-padding-remove-vertical':''">
            <ng-content select="[sticky_footer]"></ng-content>
          </div>
        </div>
      </div>
      <div id="page_content_header" #header class="uk-blur-background"
           [class.uk-border-bottom]="border && isStickyActive"
           [attr.style]="'margin-top: '+(footer_height? '-'+footer_height+'px': '0')">
        <div class="uk-container uk-container-large">
          <div [ngClass]="!isMobile?'uk-padding-small uk-padding-remove-vertical uk-padding-remove-right':''">
            <ng-content select="[header]"></ng-content>
          </div>
        </div>
      </div>
      <div id="page_content_actions" #actions class="uk-blur-background"
           [class.uk-border-bottom]="border && isStickyActive">
        <!--          <div class="uk-container uk-container-large">-->
        <div [class]="fullWidth?'':'uk-container uk-container-large'">
          <div [ngClass]="!isMobile?'uk-padding-small uk-padding-remove-vertical uk-padding-remove-right':''">
            <ng-content select="[actions]"></ng-content>
          </div>
        </div>
      </div>
      <div id="page_content_inner" [class]="fullWidth?'':'uk-container uk-container-large'">
        <!--        <div [ngClass]="!isMobile?'uk-padding-small uk-padding-remove-vertical':''">-->
        <div>
          <ng-content select="[inner]"></ng-content>
        </div>
      </div>
      <div id="page_content_footer" #footer>
        <div class="uk-container uk-container-large">
          <div [ngClass]="!isMobile?'uk-padding-small uk-padding-remove-vertical':''">
            <ng-content select="[footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})

export class PageContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public headerSticky: boolean = false;
  @Input() public border: boolean = true;
  @Input() public fullWidth: boolean = false;

  public offset: number;
  public shouldSticky: boolean = true;
  public isMobile: boolean = false;
  public isStickyActive: boolean = false;
  public footer_height: number = 0;

  @ViewChild('header') header: ElementRef;
  @ViewChild('actions') actions: ElementRef;
  @ViewChild("sticky_footer") sticky_footer: ElementRef;
  private sticky = {
    header: null,
    footer: null
  }
  subscriptions = [];

  constructor(private layoutService: DashboardSideMenuService, private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId) {
  }

  ngOnInit() {
    this.subscriptions.push(this.layoutService.isMobile.subscribe(isMobile => {
      this.isMobile = isMobile;
      if(this.isBrowser) {
        this.offset = this.isMobile?0:Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
      }
      this.cdr.detectChanges();
    }));
  }

  get isBrowser() {
    return this.platformId === 'browser';
  }

  ngAfterViewInit() {
    if (typeof document !== "undefined") {
      if (this.sticky_footer) {
        this.initFooter();
        this.observeStickyFooter();
      }
      if (this.shouldSticky && typeof document !== 'undefined') {
        setTimeout(() => {
          this.sticky.header = UIkit.sticky((this.headerSticky ? this.header.nativeElement : this.actions.nativeElement), {
            offset: this.offset
          });
          this.subscriptions.push(UIkit.util.on(document, 'active', '#' + this.sticky.header.$el.id, () => {
            this.isStickyActive = true;
            this.cdr.detectChanges();
          }));
          this.subscriptions.push(UIkit.util.on(document, 'inactive', '#' + this.sticky.header.$el.id, () => {
            this.isStickyActive = false;
            this.cdr.detectChanges();
          }));
        });
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (typeof ResizeObserver !== "undefined" && subscription instanceof ResizeObserver) {
        subscription.disconnect();
      } else if (typeof IntersectionObserver !== "undefined" && subscription instanceof IntersectionObserver) {
        subscription.disconnect();
      }
    });
  }

  initFooter() {
    let footer_offset = this.calcStickyFooterOffset(this.sticky_footer.nativeElement);
    this.sticky.footer = UIkit.sticky(this.sticky_footer.nativeElement, {end: true, offset: footer_offset});
  }

  private observeStickyFooter() {
    if (this.sticky_footer) {
      let resizeObs = new ResizeObserver(entries => {
        entries.forEach(entry => {
          setTimeout(() => {
            this.initFooter();
          });
        })
      });
      this.subscriptions.push(resizeObs);
      resizeObs.observe(this.sticky_footer.nativeElement);
    }
  }

  calcStickyFooterOffset(element) {
    this.footer_height = element.offsetHeight;
    this.cdr.detectChanges();
    return window.innerHeight - this.footer_height;
  }
}
