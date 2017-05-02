import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { APP_ROUTING, ROUTE_COMPONENTS } from './app.routes';
import { AppComponent } from './app.component';

import { API_HTTP_PROVIDERS } from './app.api-http';
import { Constants } from './shared/constants';
import {
    AuthGuard,
    ContextMenu,
    InlineEdit,
    Modal,
    Notifications,
    TopNav,
    AuthService,
    ContextMenuService,
    ModalService,
    NotificationsService,
    StringsService
} from './shared/index';
import { BoardService } from './board/board.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        APP_ROUTING,
        DragulaModule
    ],
    providers: [
        API_HTTP_PROVIDERS,
        AuthGuard,
        Constants,
        Title,
        AuthService,
        BoardService,
        ContextMenuService,
        ModalService,
        NotificationsService,
        StringsService
    ],
    declarations: [
        AppComponent,
        InlineEdit,
        ContextMenu,
        Modal,
        Notifications,
        TopNav,
        ...ROUTE_COMPONENTS
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }

