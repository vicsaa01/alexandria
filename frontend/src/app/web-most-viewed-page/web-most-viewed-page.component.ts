import { Component } from '@angular/core';
import { GlobalTableComponent } from '../global-table/global-table.component';
import { Client } from '../../client';

@Component({
  selector: 'app-web-most-viewed-page',
  standalone: true,
  imports: [GlobalTableComponent],
  templateUrl: './web-most-viewed-page.component.html',
  styleUrl: './web-most-viewed-page.component.css'
})
export class WebMostViewedPageComponent {
  sites: { _id: any; title: string; url: string; totalViews: number}[] = [];

  constructor(private client: Client) {}

  ngOnInit(): void {
    // Fetch from API
    fetch(this.client.apiUrl + '/web-most-viewed')
    .then(res => res.json())
    .then(data => {
      this.sites = data;
    })
    .catch(error => {
      console.log('Error: ' + error.message);
    })
  }
}