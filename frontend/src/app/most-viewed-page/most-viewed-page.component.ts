import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-most-viewed-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './most-viewed-page.component.html',
  styleUrl: './most-viewed-page.component.css'
})
export class MostViewedPageComponent {
  mostViewed: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {}

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
        this.mostViewed = data;
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });
  }
}
