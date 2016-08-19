import { Component } from '@angular/core';

import { TopNav } from '../shared/index';
import { SettingsService } from './settings.service';
import {
    UserSettings,
    UserAdmin,
    BoardAdmin
} from './index';

@Component({
    selector: 'tb-settings',
    templateUrl: 'app/settings/settings.component.html',
    directives: [
        TopNav,
        UserSettings,
        UserAdmin,
        BoardAdmin
    ],
    providers: [ SettingsService ]
})
export class Settings {
    constructor(private settings: SettingsService) {
    }
}

