import { Routes } from '@angular/router';

import { HomePageComponent } from './home-page/home-page.component';
import { RecentPageComponent } from './recent-page/recent-page.component';
import { FavoritesPageComponent } from './favorites-page/favorites-page.component';
import { MostViewedPageComponent } from './most-viewed-page/most-viewed-page.component';

export const routes: Routes = [
    {path: '', component: HomePageComponent},
    {path: 'recent', component: RecentPageComponent},
    {path: 'favorites', component: FavoritesPageComponent},
    {path: 'most-viewed', component: MostViewedPageComponent}
];
