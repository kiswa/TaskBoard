import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationsService {
    private notifications = new Subject<Notification>();

    public noteAdded = this.notifications.asObservable();

    public add(notification: Notification): void {
        this.notifications.next(notification);
    }
}

