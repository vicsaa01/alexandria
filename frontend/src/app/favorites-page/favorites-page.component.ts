import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css'
})
export class FavoritesPageComponent {
  favorites: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  ngOnInit(): void {
    // Fetch favorite sites
    fetch(apiURL + '/favorites')
    .then(res => res.json())
    .then((data) => {
      this.favorites = data;
    })
    .catch((error) => {
      console.log('Error: ' + error.message);
    });
  }
}
