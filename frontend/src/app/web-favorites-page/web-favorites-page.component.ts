import { Component } from '@angular/core';
import { GlobalTableComponent } from '../global-table/global-table.component';
import { Client } from '../../client';

@Component({
  selector: 'app-web-favorites-page',
  standalone: true,
  imports: [GlobalTableComponent],
  templateUrl: './web-favorites-page.component.html',
  styleUrl: './web-favorites-page.component.css'
})
export class WebFavoritesPageComponent {
  sites: { _id: any; title: string; url: string; totalSaves: number}[] = [];

  constructor(private client: Client) {}

  ngOnInit(): void {
    // Fetch from API
    fetch(this.client.apiUrl + '/web-favorites')
    .then(res => res.json())
    .then(data => {
      this.sites = data;
    })
    .catch(error => {
      console.log('Error: ' + error.message);
    })
  }
}