import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-recent-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './recent-page.component.html',
  styleUrl: './recent-page.component.css'
})
export class RecentPageComponent {
  recent: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  ngOnInit(): void {
      // Fetch recent sites
      fetch(apiURL + '/recent', {
        method: 'GET',
        headers: {
          'Authorization': /* update to JWT or other */ 'Basic ' + /* update to localStorage or sessionStorage.getItem('username' or 'password') */ btoa('victor:1234567890')
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
