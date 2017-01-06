import { Component } from '@angular/core';

import { Notification } from '../models/notification.model';
import { NotificationsService } from './notifications.service';

@Component({
    selector: 'tb-notifications',
    templateUrl: 'app/shared/notifications/notifications.component.html'
})
export class Notifications {
    private notes: Array<Notification>;

    constructor(private notifications: NotificationsService) {
        this.notes = new Array<Notification>();

        notifications.noteAdded
            .subscribe(note => {
                this.notes.push(note);
                setTimeout(() => { this.hide.bind(this)(note); }, 3000);
            });
    }

    private hide(note: Notification): void {
        let index = this.notes.indexOf(note);

        if (index >= 0) {
            note.type += ' clicked';

            setTimeout(() => {
                this.notes.splice(index, 1);
            },         500); // 500ms is the fade out transition time
        }
    }
}

