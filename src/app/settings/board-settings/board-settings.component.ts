import { Component } from '@angular/core';

import {
    ApiResponse,
    Modal,
    Notification,
    ModalService,
    NotificationsService
} from '../../shared/index';

@Component({
    selector: 'tb-board-settings',
    templateUrl: 'app/settings/board-settings/board-settings.component.html',
    directives: [ Modal ]
})
export class BoardSettings {
}

