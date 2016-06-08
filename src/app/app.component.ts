import { Component } from '@angular/core';

import { TopNav } from './top-nav/top-nav.component';
import { Settings } from './settings/settings.component';
import { Dashboard } from './dashboard/dashboard.component';

@Component({
    selector: 'app-component',
    directives: [ TopNav, Settings, Dashboard ],
    templateUrl: 'app/app.template.html'
})
export class AppComponent {
}

