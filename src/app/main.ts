import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { enableProdMode } from '@angular/core';

import { AppComponent } from './app.component';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { API_HTTP_PROVIDERS } from './app.api-http';
import { NotificationsService, ModalService } from './shared/index';
import { Constants } from './shared/constants';

// enableProdMode();

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    disableDeprecatedForms(),
    provideForms(),
    APP_ROUTER_PROVIDERS,
    API_HTTP_PROVIDERS,
    Constants,
    NotificationsService,
    ModalService
]);

