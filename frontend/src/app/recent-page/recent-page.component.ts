import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';
import { PaginatorComponent } from '../paginator/paginator.component';

@Component({
  selector: 'app-recent-page',
  standalone: true,
  imports: [CommonModule, DefaultTableComponent],
  templateUrl: './recent-page.component.html',
  styleUrl: './recent-page.component.css'
})
export class RecentPageComponent extends PaginatorComponent {
  recent: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {
    super();
    this.itemsPage = 5;
  }

  ngOnInit(): void {
      // Generate JWT token
      const token = this.jwt.createToken(60);

      // Fetch recent sites
      fetch(this.client.apiUrl + '/recent', {
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
        this.recent = data;
        this.displayed = this.paginate(this.recent);
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });
  }

  choosePage(page: number): void {
    this.displayed = this.setPage(page, this.recent);
  }
}
