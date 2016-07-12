import { Component } from '@angular/core';

import { Login } from './login/login.component';
import { TopNav } from './top-nav/top-nav.component';
import { Board } from './board/board.component';
import { Settings } from './settings/settings.component';
import { Dashboard } from './dashboard/dashboard.component';

@Component({
    selector: 'app-component',
    directives: [ Login, TopNav, Board, Settings, Dashboard ],
    templateUrl: 'app/app.component.html'
})
export class AppComponent {
}

