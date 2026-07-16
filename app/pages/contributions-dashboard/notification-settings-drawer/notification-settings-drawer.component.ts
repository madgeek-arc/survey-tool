import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NotificationSettingsService } from '../../../services/notification-settings.service';

@Component({
  selector: 'app-notification-settings-drawer',
  templateUrl: './notification-settings-drawer.component.html',
  standalone: true,
  imports: [FormsModule, DatePipe]
})
export class NotificationSettingsDrawerComponent {
  protected readonly svc = inject(NotificationSettingsService);
}
