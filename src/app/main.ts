import { bootstrap } from '@angular/platform-browser-dynamic';
// import { ROUTER_PROVIDERS } from '@angular/router';
import { HTTP_PROVIDERS } from '@angular/http';
//import { enableProdMode } from '@angular/core';

import { AppComponent } from './app.component';
import { Constants } from './app.constants';

//enableProdMode();

bootstrap(AppComponent, [
    // ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    Constants
]);

