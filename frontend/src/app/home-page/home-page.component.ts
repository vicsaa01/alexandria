import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  recent: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];
  mostViewed: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client) {}

  ngOnInit(): void {
    // Fetch recent sites
    fetch(this.client.apiUrl + '/recent', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + /* update to JWT and localStorage or sessionStorage.getItem */ btoa('victor:1234567890')
      }
    })
    .then(res => res.json())
    .then((data) => {
      this.recent = data;
    })
    .catch((error) => {
      console.log('Error: ' + error.message);
    });

    // Fetch most viewed sites
    fetch(this.client.apiUrl + '/most-viewed')
    .then(res => res.json())
    .then((data) => {      
      this.mostViewed = data;
    })
    .catch((error) => {
      console.log('Error: ' + error.message);
    });
  }
}
