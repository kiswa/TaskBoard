import { Component } from '@angular/core';

import { Notifications, StringsService } from './shared/index';

@Component({
    selector: 'app-component',
    templateUrl: 'app/app.component.html'
})
export class AppComponent {
    constructor(strings: StringsService) {
        // Nothing needed
    }
}

