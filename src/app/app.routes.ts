import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './shared/index';
import { Login } from './login/login.component';
import {
    BoardDisplay,
    ColumnDisplay
} from './board/index';
import {
    Settings,
    UserAdmin,
    BoardAdmin,
    UserSettings,
    AutoActions
} from './settings/index';
import { Dashboard, Charts, Calendar } from './dashboard/index';

const ROUTES: Routes = [
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

export const ROUTE_COMPONENTS = [
    Login,
    BoardDisplay,
    ColumnDisplay,
    Settings,
    UserAdmin,
    BoardAdmin,
    UserSettings,
    AutoActions,
    Dashboard,
    Charts,
    Calendar
];

export const APP_ROUTING = RouterModule.forRoot(ROUTES);

