import { Component } from '@angular/core';
import { GlobalTableComponent } from '../global-table/global-table.component';

@Component({
  selector: 'app-web-most-viewed-page',
  standalone: true,
  imports: [GlobalTableComponent],
  templateUrl: './web-most-viewed-page.component.html',
  styleUrl: './web-most-viewed-page.component.css'
})
export class WebMostViewedPageComponent {
  sites: { _id: any; title: string; url: string; totalViews: number}[] = [];

  ngOnInit(): void {
    this.sites = [{
      _id: '123',
      title: 'Test site',
      url: 'test.com',
      totalViews: 1000
    },{
      _id: '456',
      title: 'Test site 2',
      url: 'test2.com',
      totalViews: 500
    }]
  }
}
