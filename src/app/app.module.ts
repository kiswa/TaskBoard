import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { DragulaModule } from 'ng2-dragula/dist';

import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';
import { ApiInterceptor } from './app.api-http';

import { Login } from './login/login.component';
import { BoardModule } from './board/board.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    DragulaModule.forRoot(),
    BoardModule,
    DashboardModule,
    SettingsModule,
    SharedModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    }
  ],
  declarations: [
    AppComponent,
    Login
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

