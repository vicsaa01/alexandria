import { Component } from '@angular/core';
import { ListsTableComponent } from '../lists-table/lists-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-my-lists-page',
  standalone: true,
  imports: [ListsTableComponent],
  templateUrl: './my-lists-page.component.html',
  styleUrl: './my-lists-page.component.css'
})
export class MyListsPageComponent {
  myLists: { _id: any; user_id: string; name: string; dateAdded: string; }[] = [];

  ngOnInit(): void {
    // Fetch lists
    fetch(apiURL + '/my-lists')
    .then(res => res.json())
    .then((data) => {
      this.myLists = data;
    })
    .catch(error => console.error('Error: ', error));
  }
}
