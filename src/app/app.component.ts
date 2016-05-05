import { Component } from '@angular/core';

import { TopNav } from './top-nav/top-nav.component';

@Component({
    selector: 'app-component',
    directives: [ TopNav ],
    templateUrl: 'app/app.template.html'
})
export class AppComponent {
}

