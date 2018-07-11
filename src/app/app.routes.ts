import { Routes } from '@angular/router';

import { BoardDisplay } from './board/board.component';
import { Login } from './login/login.component';
import { Settings } from './settings/settings.component';
import { Dashboard } from './dashboard/dashboard.component';
import { AuthGuard } from './shared/auth/auth.guard';

export const ROUTES: Routes = [
  {
    path: '',
    component: Login
  },
  {
    path: 'boards',
    component: BoardDisplay,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'boards/:id',
    component: BoardDisplay,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'settings',
    component: Settings,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [ AuthGuard ]
  }
];

