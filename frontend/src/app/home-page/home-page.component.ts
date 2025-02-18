import { Component } from '@angular/core';

import { DefaultTableComponent } from '../default-table/default-table.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DefaultTableComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  recent: { tag: string; url: string; views: number; lastViewedOn: string; dateAdded: string; }[] = [
    { tag: 'YouTube', url: 'https://www.youtube.com/', views: 89, lastViewedOn: '2025-02-17 11:30', dateAdded: '2020-03-24 15:30'},
    { tag: 'Gmail', url: 'https://www.gmail.com/', views: 112, lastViewedOn: '2025-02-14 16:30', dateAdded: '2019-11-02 18:00'},
    { tag: 'Google', url: 'https://www.google.com/', views: 85, lastViewedOn: '2025-02-14 11:30', dateAdded: '2018-05-21 12:30'},
    { tag: 'Twitter', url: 'https://www.twitter.com/', views: 67, lastViewedOn: '2025-02-13 19:30', dateAdded: '2022-07-11 16:00'},
    { tag: 'Instagram', url: 'https://www.instagram.com/', views: 33, lastViewedOn: '2025-02-12 11:30', dateAdded: '2020-11-02 10:30'},
    { tag: 'Reddit', url: 'https://www.reddit.com/', views: 54, lastViewedOn: '2025-02-10 11:30', dateAdded: '2018-11-02 18:00'},
    { tag: 'WhatsApp', url: 'https://www.whatsapp.com/', views: 124, lastViewedOn: '2025-02-06 11:30', dateAdded: '2014-11-02 18:00'}
  ];
  mostViewed: { tag: string; url: string; views: number; lastViewedOn: string; dateAdded: string; }[] = [
    { tag: 'WhatsApp', url: 'https://www.whatsapp.com/', views: 124, lastViewedOn: '2025-02-06 11:30', dateAdded: '2014-11-02 18:00'},
    { tag: 'Gmail', url: 'https://www.gmail.com/', views: 112, lastViewedOn: '2025-02-14 16:30', dateAdded: '2019-11-02 18:00'},
    { tag: 'YouTube', url: 'https://www.youtube.com/', views: 89, lastViewedOn: '2025-02-17 11:30', dateAdded: '2020-03-24 15:30'},
    { tag: 'Google', url: 'https://www.google.com/', views: 85, lastViewedOn: '2025-02-14 11:30', dateAdded: '2018-05-21 12:30'},
    { tag: 'Twitter', url: 'https://www.twitter.com/', views: 67, lastViewedOn: '2025-02-13 19:30', dateAdded: '2022-07-11 16:00'},
    { tag: 'Reddit', url: 'https://www.reddit.com/', views: 54, lastViewedOn: '2025-02-10 11:30', dateAdded: '2018-11-02 18:00'},
    { tag: 'Instagram', url: 'https://www.instagram.com/', views: 33, lastViewedOn: '2025-02-12 11:30', dateAdded: '2020-11-02 10:30'}
  ];
}
