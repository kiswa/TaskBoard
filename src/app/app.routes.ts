import { RouterConfig, provideRouter } from '@angular/router';

import { Login } from './login/login.component';
import { Board } from './board/board.component';

const ROUTES: RouterConfig = [
    {
        path: '',
        component: Login
    }
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(ROUTES)
];

