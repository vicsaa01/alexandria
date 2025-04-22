import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, DefaultTableComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  loggedIn: boolean = false;
  recent: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];
  mostViewed: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  constructor(private client: Client, private jwt: JSONWebToken) {}

  async ngOnInit(): Promise<void> {
    // Check if logged in
    if (localStorage.getItem('sessionToken') != null && localStorage.getItem('userID') != null) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }

    // Generate JWT token
    const token = await this.jwt.createValidatedToken(60);

    if (token !== "Invalid session") {
      // Fetch recent sites
      fetch(this.client.httpsUrl + '/recent', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => res.json())
      .then((data) => {
        this.recent = data.slice(0,5);
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });

      // Fetch most viewed sites
      fetch(this.client.httpsUrl + '/most-viewed', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => res.json())
      .then((data) => {      
        this.mostViewed = data.slice(0,5);
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });
    } else {
      if (this.loggedIn === true) alert("Your session is invalid. Please log out and log in again.");
    }
  }
}
