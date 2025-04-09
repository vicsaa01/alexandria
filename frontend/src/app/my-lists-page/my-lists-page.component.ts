import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListsTableComponent } from '../lists-table/lists-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';
import { PaginatorComponent } from '../paginator/paginator.component';

@Component({
  selector: 'app-my-lists-page',
  standalone: true,
  imports: [CommonModule, ListsTableComponent],
  templateUrl: './my-lists-page.component.html',
  styleUrl: './my-lists-page.component.css'
})
export class MyListsPageComponent extends PaginatorComponent {
  myLists: { _id: any; user_id: string; name: string; dateAdded: string; }[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {
    super();
    this.itemsPage = 5;
  }

  ngOnInit(): void {
    // Generate JWT token
    const token = this.jwt.createToken(60);

    // Fetch lists
    fetch(this.client.apiUrl + '/my-lists', {
      method: 'GET',
      headers: {'Authorization':'Bearer ' + token}
    })
    .then(res => res.json())
    .then((data) => {
      if (data.error) {
        console.log('Error: ' + data.error);
        return;
      }
      this.myLists = data;
      this.displayed = this.paginate(this.myLists);
    })
    .catch(error => console.error('Error: ', error));
  }

  choosePage(page: number): void {
    this.displayed = this.setPage(page, this.myLists);
  }
}
