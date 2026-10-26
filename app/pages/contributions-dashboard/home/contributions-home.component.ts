import {Component, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: 'app-contributions-home',
    templateUrl: './contributions-home.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class ContributionsHomeComponent {

  title: string = 'Title';
  text: string = 'Text';

}
