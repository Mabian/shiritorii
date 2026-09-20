import { Routes } from '@angular/router';

import { knownGameMode } from './game/known-game-mode';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
  {
    path: 'play/:mode',
    canActivate: [knownGameMode],
    loadComponent: () => import('./game/game').then((m) => m.Game),
  },
  { path: '**', redirectTo: '' },
];
