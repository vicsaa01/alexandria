import { Component } from '@angular/core';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-most-viewed-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './most-viewed-page.component.html',
  styleUrl: './most-viewed-page.component.css'
})
export class MostViewedPageComponent {
  mostViewed: { _id: any; user_id: string; site_id: string; tag: string; views: number; lastViewedOn: string; dateAdded: string; }[] = [];

  ngOnInit(): void {
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
