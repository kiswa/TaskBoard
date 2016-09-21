import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './shared/index';
import { Login } from './login/login.component';
import { Board } from './board/board.component';
import {
    Settings,
    UserAdmin,
    BoardAdmin,
    UserSettings
} from './settings/index';
import { Dashboard, Charts, Calendar } from './dashboard/index';

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

export const ROUTE_COMPONENTS = [
    Login,
    Board,
    Settings,
    UserAdmin,
    BoardAdmin,
    UserSettings,
    Dashboard,
    Charts,
    Calendar
];

export const APP_ROUTING = RouterModule.forRoot(ROUTES);

