import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './default-table.component.html',
  styleUrl: './default-table.component.css'
})
export class DefaultTableComponent {
  @Input() name: string = '';
  @Input() columnNames: string[] = [];
  @Input() sites: { _id: any; user_id: string; site_id: string; tag: string; views: number; lastViewedOn: string; dateAdded: string; }[] = [];
}
