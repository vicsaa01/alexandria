import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { apiURL } from '../app.component';

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

  showRemoveMenu: boolean = false;
  list_id: any;
  list_name: string = '';

  openRemoveMenu(id: any, name: string): void {
    this.showRemoveMenu = true;
    this.list_id = id;
    this.list_name = name;
  }

  closeMenu(): void {
    this.showRemoveMenu = false;
  }

  remove(id: any): void {
    fetch(apiURL + '/remove-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: id.$oid })
    })
    .then(res => res.json())
    .then((data) => {
      alert(data.message);
      window.location.reload();
    })
    .catch(error => {
      console.error('Error: ', error);
      alert("Server did not respond. Please try again later.");
    });
  }
}
