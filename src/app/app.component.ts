import { Component } from '@angular/core';

import { TopNav } from './top-nav/top-nav.component';
import { Settings } from './settings/settings.component';

@Component({
    selector: 'app-component',
    directives: [ TopNav, Settings ],
    templateUrl: 'app/app.template.html'
})
export class AppComponent {
}

