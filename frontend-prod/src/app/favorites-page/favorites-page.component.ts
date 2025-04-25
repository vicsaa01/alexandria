import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtendedTableComponent } from '../extended-table/extended-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';
import { PaginatorComponent } from '../paginator/paginator.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, ExtendedTableComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css'
})
export class FavoritesPageComponent extends PaginatorComponent {
  favorites: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {
    super();
    this.itemsPage = 5;
  }

  async ngOnInit(): Promise<void> {
    // Generate JWT token
    const token = await this.jwt.createValidatedToken(60);

    // Fetch favorite sites
    if (token !== "Invalid session") {
      fetch(this.client.httpsUrl + '/favorites', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => res.json())
      .then((data) => {
        if (data.error) {
          console.log('Error: ' + data.error);
          return;
        }
        this.favorites = data;
        this.displayed = this.paginate(this.favorites);
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });
    } else {
      alert("Your session is invalid. Please log in correctly.");
    }
  }

  choosePage(page: number): void {
    this.displayed = this.setPage(page, this.favorites);
  }
}
