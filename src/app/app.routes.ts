import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, AuthService } from './shared/index';
import { Login } from './login/login.component';
import { Board } from './board/board.component';
import { Settings } from './settings/settings.component';
import { Dashboard } from './dashboard/dashboard.component';

const ROUTES: Routes = [
    {
        path: '',
        component: Login
    },
    {
        path: 'boards',
        component: Board,
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

export const APP_COMPONENTS = [
    Login, Board, Settings, Dashboard
];

export const APP_ROUTING = RouterModule.forRoot(ROUTES);

