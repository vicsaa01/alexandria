import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';

@Component({
  selector: 'app-most-viewed-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './most-viewed-page.component.html',
  styleUrl: './most-viewed-page.component.css'
})
export class MostViewedPageComponent {
  mostViewed: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client) {}

  ngOnInit(): void {
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
