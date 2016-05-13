import { Component } from '@angular/core';

@Component({
    selector: 'tb-settings',
    templateUrl: 'app/settings/settings.template.html'
})
export class Settings {
    public user = {
        isAdmin: true
    };
}

