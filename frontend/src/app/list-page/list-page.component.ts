import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ListItemsTableComponent } from '../list-items-table/list-items-table.component';
import { Client } from '../../client';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [ListItemsTableComponent],
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.css'
})
export class ListPageComponent {
  id: string | null = '<id>';
  name: string = '<list name>';
  username: string = '<username>';
  dateAdded: string = '<datetime>';
  items: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  // Add ActivatedRoute property when loading page
  constructor(private route: ActivatedRoute, private client: Client) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
    });

    // Fetch list info
    fetch(this.client.apiUrl + '/list?id=' + this.id)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        console.log(data[0]);
        this.name = data[0].name;
        this.dateAdded = data[0].dateAdded;
        this.username = data[0].username;
      }
    })
    .catch(error => console.error('Error: ', error));

    // Fetch list items
    fetch(this.client.apiUrl + '/list-items?id=' + this.id)
    .then(res => res.json())
    .then(data => {
      this.items = data;
    })
  }
}