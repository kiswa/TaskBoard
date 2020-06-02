import { Routes } from '@angular/router';

import { BoardDisplayComponent } from './board/board.component';
import { FileViewerComponent } from './files/file-viewer.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared/auth/auth.guard';

export const ROUTES: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'boards',
    component: BoardDisplayComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'boards/:id',
    component: BoardDisplayComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'files/:hash',
    component: FileViewerComponent,
    canActivate: [ AuthGuard ]
  }
];

