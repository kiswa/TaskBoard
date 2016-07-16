import { RouterConfig, provideRouter } from '@angular/router';

import { AuthGuard, AuthService } from './shared/index';
import { Login } from './login/login.component';
import { Board } from './board/board.component';
import { Settings } from './settings/settings.component';
import { Dashboard } from './dashboard/dashboard.component';

const ROUTES: RouterConfig = [
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

export const APP_ROUTER_PROVIDERS = [
    provideRouter(ROUTES),
    AuthGuard,
    AuthService
];

