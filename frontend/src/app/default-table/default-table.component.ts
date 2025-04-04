import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../client';
import { JSONWebToken } from '../../jwt';

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
  @Input() path: string = '';

  constructor(protected client: Client, protected jwt: JSONWebToken) {}

  viewSite(id: any, url: string): void {
    // Generate JWT token
    const token = this.jwt.createToken(60);

    // Fetch most viewed sites
    fetch(this.client.apiUrl + '/view-site?id=' + id.$oid, {
      method: 'POST',
      headers: {'Authorization':'Bearer ' + token}
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.message);
      window.location.href = url;
    })
  }
}
