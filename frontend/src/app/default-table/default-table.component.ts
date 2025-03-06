import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { apiURL } from '../app.component';

@Component({
  selector: 'app-default-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './default-table.component.html',
  styleUrl: './default-table.component.css'
})
export class DefaultTableComponent {
  @Input() columnNames: string[] = [];
  @Input() sites: { _id: any; tag: string; views: number; lastViewedOn: string; dateAdded: string; url: string}[] = [];

  viewSite(_id: any): void {
    fetch(apiURL + '/view-site?id=' + _id.$oid)
    .then(res => res.json())
    .then(data => {
      console.log(data.message);
    })
  }
}
