import { Component } from '@angular/core';

import { TopNav } from '../shared/index';
import {
    UserSettings,
    UserAdmin,
    BoardSettings
} from './index';

@Component({
    selector: 'tb-settings',
    templateUrl: 'app/settings/settings.component.html',
    directives: [
        TopNav,
        UserSettings,
        UserAdmin,
        BoardSettings
    ]
})
export class Settings {
}

