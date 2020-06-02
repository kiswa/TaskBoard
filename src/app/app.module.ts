import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';
import { ApiInterceptor } from './app.api-http';

import { LoginComponent } from './login/login.component';
import { BoardModule } from './board/board.module';
import { FileModule } from './files/file-viewer.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';

function getBasePath() {
  let path = window.location.pathname;

  ['/boards', '/settings', '/dashboard'].forEach(p => {
    path = path.replace(p, '');
  });

  return path;
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BoardModule,
    FileModule,
    DashboardModule,
    DragDropModule,
    SettingsModule,
    SharedModule,
    RouterModule.forRoot(ROUTES)
  ],

  providers: [
    {
    provide: HTTP_INTERCEPTORS,
    useClass: ApiInterceptor,
    multi: true
  },
    {
      provide: APP_BASE_HREF,
      useFactory: getBasePath
    }
  ],

  declarations: [
    AppComponent,
    LoginComponent
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }

