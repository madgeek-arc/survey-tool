import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SurveyModalsService } from '../../../services/survey-modals.service';

@Component({
  selector: 'app-survey-modals',
  templateUrl: './survey-modals.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class SurveyModalsComponent {
  protected readonly svc = inject(SurveyModalsService);
}
