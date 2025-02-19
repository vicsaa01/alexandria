import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  recent: { _id: any; user_id: string; site_id: string; tag: string; views: number; lastViewedOn: string; dateAdded: string; }[] = [];
  mostViewed: { _id: any; user_id: string; site_id: string; tag: string; views: number; lastViewedOn: string; dateAdded: string; }[] = [];

  ngOnInit(): void {
    // Fetch recent sites
    fetch(apiURL + '/recent')
    .then(res => res.json())
    .then((data) => {
      console.log('Success: (see line below)');
      console.log(data);        
      this.recent = data;
    })
    .catch((error) => {
      console.log('Error: ' + error.message);
    });

    // Fetch most viewed sites
    fetch(apiURL + '/most-viewed')
    .then(res => res.json())
    .then((data) => {
      console.log('Success: (see line below)');
      console.log(data);        
      this.mostViewed = data;
    })
    .catch((error) => {
      console.log('Error: ' + error.message);
    });
  }
}
