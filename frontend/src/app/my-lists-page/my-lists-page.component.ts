import { Component } from '@angular/core';
import { ListsTableComponent } from '../lists-table/lists-table.component';
import { Client } from '../../client';

@Component({
  selector: 'app-my-lists-page',
  standalone: true,
  imports: [ListsTableComponent],
  templateUrl: './my-lists-page.component.html',
  styleUrl: './my-lists-page.component.css'
})
export class MyListsPageComponent {
  myLists: { _id: any; user_id: string; name: string; dateAdded: string; }[] = [];

  constructor(private client: Client) {}

  ngOnInit(): void {
    // Fetch lists
    fetch(this.client.apiUrl + '/my-lists')
    .then(res => res.json())
    .then((data) => {
      this.myLists = data;
    })
    .catch(error => console.error('Error: ', error));
  }
}
