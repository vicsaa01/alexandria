import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lists-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lists-table.component.html',
  styleUrl: './lists-table.component.css'
})
export class ListsTableComponent {
  @Input() columnNames: string[] = [];
  @Input() lists: { _id: any; user_id: string; name: string; dateAdded: string; }[] = [];
}
