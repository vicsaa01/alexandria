import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

/* Create a separate class for this */
const jwt = require('jsonwebtoken');
const jwtKey = 'vixKey42';

@Component({
  selector: 'app-recent-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './recent-page.component.html',
  styleUrl: './recent-page.component.css'
})
export class RecentPageComponent {
  recent: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  /* Create a separate class for this */
  createToken(exp: string): string {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');
    const token = jwt.sign({ username: username, password: password }, jwtKey, { expiresIn: exp });
    return token;
  }

  ngOnInit(): void {
      // Generate JWT token
      const token = this.createToken('1h');

      // Fetch recent sites
      fetch(apiURL + '/recent', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(res => res.json())
      .then((data) => {     
        this.recent = data;
      })
      .catch((error) => {
        console.log('Error: ' + error.message);
      });
  }
}
