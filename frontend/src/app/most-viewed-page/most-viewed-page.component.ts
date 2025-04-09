import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';
import { PaginatorComponent } from '../paginator/paginator.component';

@Component({
  selector: 'app-most-viewed-page',
  standalone: true,
  imports: [CommonModule, DefaultTableComponent],
  templateUrl: './most-viewed-page.component.html',
  styleUrl: './most-viewed-page.component.css'
})
export class MostViewedPageComponent extends PaginatorComponent {
  mostViewed: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {
    super();
    this.itemsPage = 5;
  }

  ngOnInit(): void {
      // Generate JWT token
      const token = this.jwt.createToken(60);

      // Fetch most viewed sites
      fetch(this.client.apiUrl + '/most-viewed', {
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
        this.mostViewed = data;
        this.displayed = this.paginate(this.mostViewed);
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });
  }

  choosePage(page: number): void {
    this.displayed = this.setPage(page, this.mostViewed);
  }
}
