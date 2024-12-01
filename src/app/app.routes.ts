import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ListComponent } from './features/list/list.component';
import { DetailsComponent } from './features/details/details.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'lists',
    children: [
      {
        path: 'want-to-listen',
        loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
        data: { listType: 'want-to-listen' }
      },
      {
        path: 'currently-playing',
        loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
        data: { listType: 'currently-playing' }
      },
      {
        path: 'listened',
        loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
        data: { listType: 'listened' }
      },
      {
        path: 'favorites',
        loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
        data: { listType: 'favorites' }
      }
    ]
  },
  {
    path: 'bands',
    loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
    data: { type: 'band' }
  },
  {
    path: 'bands/:slug',
    loadComponent: () => import('./features/details/details.component').then(m => m.DetailsComponent),
    data: { type: 'band' }
  },
  {
    path: 'artists',
    loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
    data: { type: 'artist' }
  },
  {
    path: 'artists/:slug',
    loadComponent: () => import('./features/details/details.component').then(m => m.DetailsComponent),
    data: { type: 'artist' }
  },
  {
    path: 'albums',
    loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
    data: { type: 'album' }
  },
  {
    path: 'albums/:slug',
    loadComponent: () => import('./features/details/details.component').then(m => m.DetailsComponent),
    data: { type: 'album' }
  },
  {
    path: 'genres',
    loadComponent: () => import('./features/list/list.component').then(m => m.ListComponent),
    data: { type: 'genre' }
  },
  {
    path: 'genres/:slug',
    loadComponent: () => import('./features/details/details.component').then(m => m.DetailsComponent),
    data: { type: 'genre' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
