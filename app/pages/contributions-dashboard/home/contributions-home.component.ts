import {Component, ChangeDetectionStrategy} from "@angular/core";
import { PageContentComponent } from "../../../shared/page-content/page-content.component";
import { SidebarMobileToggleComponent } from "../../../shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";

@Component({
    selector: 'app-contributions-home',
    templateUrl: './contributions-home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageContentComponent, SidebarMobileToggleComponent]
})

export class ContributionsHomeComponent {

  title: string = 'Title';
  text: string = 'Text';

}
