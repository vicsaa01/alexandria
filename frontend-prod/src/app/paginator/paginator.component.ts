import { Component } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css'
})
export class PaginatorComponent {
  iterable: any[] = [];
  displayed: any[] = [];
  itemsPage: number = 5;
  totalPages: number = 1;
  pages: number[] = [];
  selectedPage: number = 0;

  paginate(iterable: any[]): any[] {
    this.totalPages = Math.ceil(iterable.length/this.itemsPage);
    for (let i=0; i<this.totalPages; i++) {
      this.pages[i]=i;
    }
    return iterable.slice(this.selectedPage * this.itemsPage, this.selectedPage * this.itemsPage + this.itemsPage);
  }

  setPage(page: number, iterable: any[]): any[] {
    this.selectedPage = page;
    return iterable.slice(this.selectedPage * this.itemsPage, this.selectedPage * this.itemsPage + this.itemsPage);
  }
}