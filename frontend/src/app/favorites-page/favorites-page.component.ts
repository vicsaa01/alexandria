import { Component } from '@angular/core';
import { ExtendedTableComponent } from '../extended-table/extended-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [ExtendedTableComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css'
})
export class FavoritesPageComponent {
  favorites: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {}

  ngOnInit(): void {
    // Generate JWT token
    const token = this.jwt.createToken(60);

    // Fetch favorite sites
    fetch(this.client.apiUrl + '/favorites', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => res.json())
    .then((data) => {
      this.favorites = data;
    })
    .catch((error) => {
      console.log('Error: ' + error.message);
    });
  }
}
