import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [DefaultTableComponent],
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
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
    });

    // Fetch list info
    fetch(apiURL + '/list?id=' + this.id)
    .then(res => res.json())
    .then(data => {
      this.name = data.name;
      this.dateAdded = data.dateAdded;
      this.username = 'user' + data.user_id; // fetch from users table
    })
    .catch(error => console.error('Error: ', error));

    // Fetch list items
    fetch(apiURL + '/list-items?id=' + this.id)
    .then(res => res.json())
    .then(data => {
      this.items = data;
    })
  }
}