import { Component } from '@angular/core';
import { GlobalTableComponent } from '../global-table/global-table.component';

@Component({
  selector: 'app-web-favorites-page',
  standalone: true,
  imports: [GlobalTableComponent],
  templateUrl: './web-favorites-page.component.html',
  styleUrl: './web-favorites-page.component.css'
})
export class WebFavoritesPageComponent {
  sites: { _id: any; title: string; url: string; totalSaves: number}[] = [];

  ngOnInit(): void {
    this.sites = [{
      _id: '123',
      title: 'Test site',
      url: 'test.com',
      totalSaves: 20
    },{
      _id: '456',
      title: 'Test site 2',
      url: 'test2.com',
      totalSaves: 10
    }]
  }
}
