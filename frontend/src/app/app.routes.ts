import { Routes } from '@angular/router';

import { HomePageComponent } from './home-page/home-page.component';
import { RecentPageComponent } from './recent-page/recent-page.component';
import { FavoritesPageComponent } from './favorites-page/favorites-page.component';
import { AddFavoritePageComponent } from './add-favorite-page/add-favorite-page.component';
import { MostViewedPageComponent } from './most-viewed-page/most-viewed-page.component';
import { MyListsPageComponent } from './my-lists-page/my-lists-page.component';
import { CreateListPageComponent } from './create-list-page/create-list-page.component';
import { ListPageComponent } from './list-page/list-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { ForgotPasswordPageComponent } from './forgot-password-page/forgot-password-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';

export const routes: Routes = [
    {path: '', component: HomePageComponent},
    {path: 'recent', component: RecentPageComponent},
    {path: 'favorites', component: FavoritesPageComponent},
    {path: 'add-favorite', component: AddFavoritePageComponent},
    {path: 'most-viewed', component: MostViewedPageComponent},
    {path: 'my-lists', component: MyListsPageComponent},
    {path: 'create-list', component: CreateListPageComponent},
    {path: 'list', component: ListPageComponent},
    {path: 'login', component: LoginPageComponent},
    {path: 'register', component: RegisterPageComponent},
    {path: 'forgot-password', component: ForgotPasswordPageComponent},
    {path: 'settings', component: SettingsPageComponent}
];