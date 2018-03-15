import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { APP_ROUTING, ROUTE_COMPONENTS } from './app.routes';
import { AppComponent } from './app.component';
import { API_HTTP_PROVIDERS } from './app.api-http';

import { BoardModule } from './board/board.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    APP_ROUTING,
    DragulaModule,
    BoardModule,
    DashboardModule,
    SettingsModule,
    SharedModule
  ],
  providers: [
    API_HTTP_PROVIDERS,
  ],
  declarations: [
    AppComponent,
    ...ROUTE_COMPONENTS
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

