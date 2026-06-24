import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationSettingsService } from '../../../services/notification-settings.service';

@Component({
  selector: 'app-notification-settings-drawer',
  templateUrl: './notification-settings-drawer.component.html',
  styleUrl: './notification-settings-drawer.component.css',
  standalone: true,
  imports: [FormsModule]
})
export class NotificationSettingsDrawerComponent {
  protected readonly svc = inject(NotificationSettingsService);
}
