import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { IconsService } from "./icons.service";
import { Icon } from "./icons";
import { CommonModule } from "@angular/common";
import { SafeUrlPipe } from "../../../catalogue-ui/shared/pipes/safeUrlPipe";

export interface StopRule {
  class: string,
  offset: number
}

/**
 * By default, this component uses Material Icons Library to render an icon with
 * a specific @name. For custom icons you should:
 *
 *  - Add your icon in icons.ts and register it to the Icon registry by adding this to your component Module.
 *
 *    e.g. export class ExampleModule {
 *      constructor (private iconsService: IconsService) {
 *        this.iconsService.registerIcons([arrow_right])
 *      }
 *    }
 *
 *    If the name of your icon is the same with a Material Icon name, yours will be used instead of the default.
 *
 *  - Custom SVG Icon. Define a variable in your component with an SVG and give it as Input @svg.
 *
 *  In the case of SVGs, there is an opportunity to add gradient color by define at least a start and end stop-color rules
 *  and an id to support them. This option is enabled by giving id as input in @gradient (Optional @degrees for gradient direction)
 *
 *  e.g. #gradient .start {
 *    stop-color: red;
 *  }
 *
 *  e.g. #gradient .end {
 *    stop-color: orange;
 *  }
 *
 * */
@Component({
  selector: 'icon',
  imports: [
    CommonModule,
    SafeUrlPipe
  ],
  standalone: true,
  template: `
    @if (icon) {
      @if (icon.data) {
        <span #svgIcon class="uk-icon" [class.uk-preserve]="gradient || icon.preserveColor"
          [class.uk-flex]="flex" [ngClass]="customClass" [ngStyle]="style"
        [innerHTML]="icon.data | safeUrl: 'html'"></span>
      }
      @if (!icon.data && icon.name) {
        <span [class.uk-flex]="flex" [ngClass]="customClass"
          [class.uk-display-inline-block]="!flex">
          <span class="material-icons" [ngClass]="type?type:icon.type" [ngStyle]="style">{{ icon.name }}</span>
        </span>
      }
      @if (visuallyHidden) {
        <span class="visually-hidden">{{ visuallyHidden }}</span>
      }
    }
    `
})
export class IconsComponent implements AfterViewInit, OnChanges {
  private static DEFAULT_ICON_SIZE  = 20;
  @Input()
  public icon: Icon;
  public style: any;
  /**
   * Custom icon as SVG
   */
  @Input()
  public set svg(svg: string) {
    if(svg) {
      this.icon = {name: '', data: svg};
    }
  };
  @Input()
  public defaultSize = false;
  /**
   * True if this icon should have display flex (Optional, Default: false)
   *
   * */
  @Input()
  public flex = false;
  /**
   *
   * Add custom class(es)(Optional)
   * */
  @Input()
  public customClass = '';
  /**
   * Color of svg (Optional)
   * */
  @Input()
  public fill;
  /**
   * Color of svg stroke (Optional)
   * */
  @Input()
  public stroke;
  /**
   * Size of icon (Default: 1)
   *
   * Disabled if defaultSize = true
   * */
  @Input()
  public ratio = 1;
  /**
   * In the case of Material icon only. Type of icon (Optional)
   * */
  @Input()
  public type: "outlined" | "round" | "sharp" | "two-tone" | null = null;
  /**
   * Name of icon in registry(1) or Material Icons(2)
   * */
  @Input()
  set name(iconName: string) {
    if(iconName) {
      this.icon = {name: iconName, data: null};
      let icon = this.iconsService.getIcon(iconName);
      if (icon) {
        this.icon = icon;
      }
    }
  }
  /**
   * Set a visually hidden name for accessibility
   * */
  @Input()
  public visuallyHidden: string = null;
  /**
   *  Gradient rules
   *  Available only for SVG!
   *
   * Define your CSS rules for stop-colors
   * */
  @Input()
  public gradient: string = null;
  @Input()
  public degrees: number = 0;
  @Input()
  public stopRules: StopRule[]= [{class: 'start', offset: 0}, {class: 'end', offset: 100}];
  @ViewChild("svgIcon")
  public svgIcon: ElementRef;

  constructor(private iconsService: IconsService,
              private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.initIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initIcon();
  }

  initIcon() {
    if(this.icon?.data && this.svgIcon) {
      this.cdr.detectChanges();
      let svg: Element = this.svgIcon.nativeElement.getElementsByTagName('svg').item(0);
      if(!this.defaultSize && svg) {
        svg.setAttribute("width", (this.ratio * IconsComponent.DEFAULT_ICON_SIZE).toString());
        svg.setAttribute("height", (this.ratio * IconsComponent.DEFAULT_ICON_SIZE).toString());
      }
      if(this.gradient && svg) {
        this.addGradient(svg);
      } else {
        this.style = {
          fill: this.fill,
          stroke: this.stroke
        };
      }
    } else {
      this.style = {
        "font-size.px": this.ratio*IconsComponent.DEFAULT_ICON_SIZE
      };
    }
    this.cdr.detectChanges();
  }

  addGradient(svg: Element) {
    if(svg.children.length > 0 && typeof document !== "undefined") {
      let gradientDefinition = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradientDefinition.setAttribute('id', this.gradient);
      if(this.degrees !== 0) {
        let angle = (this.degrees) * (Math.PI / 180);
        gradientDefinition.setAttribute('x1', Math.round(50 + Math.sin(angle + Math.PI) * 50) + '%');
        gradientDefinition.setAttribute('y1', Math.round(50 + Math.cos(angle + Math.PI) * 50) + '%');
        gradientDefinition.setAttribute('x2', Math.round(50 + Math.sin(angle) * 50) + '%');
        gradientDefinition.setAttribute('y2', Math.round(50 + Math.cos(angle) * 50) + '%');
      }
      for(let rule of this.stopRules) {
        let item = document.createElementNS('http://www.w3.org/2000/svg','stop');
        item.setAttribute('class', rule.class);
        item.setAttribute('offset', rule.offset + '%');
        gradientDefinition.appendChild(item);
      }
      let defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
      defs.appendChild(gradientDefinition);
      for(let  i = 0; i < svg.children.length; i++) {
        let item = svg.children.item(i);
        if(!item.hasAttribute('fill')) {
          item.setAttribute('fill', "url('#" + this.gradient + "')");
        }
      }
      svg.insertBefore(defs, svg.childNodes[0]);
    }
  }
}
