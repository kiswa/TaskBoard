import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_PROVIDERS } from '@angular/http';

import { APP_ROUTING, APP_COMPONENTS } from './app.routes';
import { AppComponent } from './app.component';

import { API_HTTP_PROVIDERS } from './app.api-http';
import { Constants } from './shared/constants';
import {
    AuthGuard,
    AuthService,
    NotificationsService,
    ModalService
} from './shared/index';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        APP_ROUTING
    ],
    providers: [
        Title,
        HTTP_PROVIDERS,
        API_HTTP_PROVIDERS,
        AuthGuard,
        AuthService,
        NotificationsService,
        ModalService,
        Constants
    ],
    declarations: [
        AppComponent,
        ...APP_COMPONENTS
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }

