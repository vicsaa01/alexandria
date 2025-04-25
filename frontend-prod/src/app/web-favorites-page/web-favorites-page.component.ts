import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalTableComponent } from '../global-table/global-table.component';
import { Client } from '../../client';
import { PaginatorComponent } from '../paginator/paginator.component';

@Component({
  selector: 'app-web-favorites-page',
  standalone: true,
  imports: [CommonModule, GlobalTableComponent],
  templateUrl: './web-favorites-page.component.html',
  styleUrl: './web-favorites-page.component.css'
})
export class WebFavoritesPageComponent extends PaginatorComponent {
  sites: { _id: any; title: string; url: string; totalSaves: number}[] = [];

  constructor(private client: Client) {
    super();
    this.itemsPage = 10;
  }

  ngOnInit(): void {
    // Fetch from API
    fetch(this.client.httpsUrl + '/web-favorites')
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.log('Error: ' + data.error);
        return;
      }
      this.sites = data;
      this.displayed = this.paginate(this.sites);
    })
    .catch(error => {
      console.log('Error: ' + error.message);
    })
  }

  choosePage(page: number): void {
    this.displayed = this.setPage(page, this.sites);
  }
}