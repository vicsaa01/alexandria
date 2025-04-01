import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultTableComponent } from '../default-table/default-table.component';
import { Client } from '../../client';

@Component({
  selector: 'app-global-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-table.component.html',
  styleUrl: './global-table.component.css'
})
export class GlobalTableComponent extends DefaultTableComponent {
  @Input() type: string = "";
  @Input() favoriteSites: { _id: any; title: string; url: string; totalSaves: number}[] = [];
  @Input() mostViewedSites: { _id: any; title: string; url: string; totalViews: number}[] = [];

  constructor(protected override client: Client) {
    super(client);
  }
}
