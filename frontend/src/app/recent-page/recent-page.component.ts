import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

/* Create a separate class for this */
import * as rs from 'jsrsasign';
const jwtKey = 'dDlQOYga1SGvBPfD';

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
  createToken(expSeconds: number): string {
    const header = JSON.stringify({typ: 'JWT'});
    const payload = JSON.stringify({
      username: '67d96128f6a3613bb2bc61b0', // sessionStorage.getItem('userID');
      exp: Math.floor(Date.now()/1000) + expSeconds
    });
    const sJWT = rs.KJUR.jws.JWS.sign('HS256', header, payload, jwtKey);
    return sJWT;
  }

  ngOnInit(): void {
      // Generate JWT token
      const token = this.createToken(60);

      // Fetch recent sites
      fetch(apiURL + '/recent', {
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
