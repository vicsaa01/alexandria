import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pop-up-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up-message.component.html',
  styleUrl: './pop-up-message.component.css'
})
export class PopUpMessageComponent {
  @Input() isPopUp: boolean = true;
  @Input() type: string = "";
  @Input() message: string = "";
}
