import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ListItemsTableComponent } from '../list-items-table/list-items-table.component';
import { JSONWebToken } from '../../jwt';
import { Client } from '../../client';
import { PaginatorComponent } from '../paginator/paginator.component';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [CommonModule, ListItemsTableComponent],
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.css'
})
export class ListPageComponent extends PaginatorComponent {
  id: string | null = '<id>';
  name: string = '<list name>';
  username: string = '<username>';
  dateAdded: string = '<date added>';
  isOwner: boolean = false;
  items: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  // Add ActivatedRoute property when loading page
  constructor(private route: ActivatedRoute, private jwt: JSONWebToken, private client: Client) {
    super();
    this.itemsPage = 5;
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
    });

    // Generate JWT token
    const token = await this.jwt.createValidatedToken(60);

    // Fetch list info
    fetch(this.client.apiUrl + '/list?id=' + this.id, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.message);
        console.log("Error: " + data.error);
        return;
      }
      this.name = data.list.name;
      this.username = data.list.username;
      this.dateAdded = data.list.dateAdded;
      this.isOwner = data.isOwner;

      // Fetch list items
      fetch(this.client.apiUrl + '/list-items?id=' + this.id, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => res.json())
      .then(data => {
        this.items = data;
        this.displayed = this.paginate(this.items);
      })
      .catch(error => console.error('Error when fetching list items: ', error));
    })
    .catch(error => console.error('Error when fetching list: ', error));
  }

  choosePage(page: number): void {
    this.displayed = this.setPage(page, this.items);
  }
}