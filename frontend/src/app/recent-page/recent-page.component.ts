import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-recent-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './recent-page.component.html',
  styleUrl: './recent-page.component.css'
})
export class RecentPageComponent {
  recent: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {}

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
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });
  }
}
