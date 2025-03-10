import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-extended-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extended-table.component.html',
  styleUrl: './extended-table.component.css'
})
export class ExtendedTableComponent extends DefaultTableComponent {
  showMenu: boolean = false;
  favorite_id: any;
  favorite_tag: string = '';
  myLists: { _id: any; user_id: string; name: string; dateAdded: string; }[] = [];

  openMenu(id: any, tag: string): void {
    this.showMenu = true;
    this.favorite_id = id.$oid;
    this.favorite_tag = tag;

    if (this.showMenu) {
      // Fetch lists
      fetch(apiURL + '/my-lists')
      .then(res => res.json())
      .then((data) => {
        this.myLists = data;
      })
      .catch(error => console.error('Error: ', error));
    }
  }

  closeMenu(): void {
    this.showMenu = false;
  }

  addToList(id: any): void {
    // Send data to API
    fetch(apiURL + '/add-to-list', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        favorite_id: this.favorite_id,
        list_id: id.$oid
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.error != null) {
        console.error('Error: ', data.error);
      }
      this.showMenu = false;
    })
    .catch(error => console.error('Error: ', error));
  }
}
