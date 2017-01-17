import { Component } from '@angular/core';

import { AutoActionsService } from './auto-actions.service';

import {
    ApiResponse,
    User,
    Modal,
    Notification,
    AuthService,
    ModalService,
    NotificationsService
} from '../../shared/index';

@Component({
    selector: 'tb-auto-actions',
    templateUrl: 'app/settings/auto-actions/auto-actions.component.html',
    providers: [ AutoActionsService ]
})
export class AutoActions {
    private activeUser: User;
    private showActions: boolean;

    constructor(private auth: AuthService,
                private modal: ModalService,
                private notes: NotificationsService,
                private actions: AutoActionsService) {
        this.showActions = false;

        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = new User(+activeUser.default_board_id,
                                           activeUser.email,
                                           +activeUser.id,
                                           activeUser.last_login,
                                           +activeUser.security_level,
                                           +activeUser.user_option_id,
                                           activeUser.username,
                                           activeUser.board_access);
                if (+activeUser.security_level < 3) {
                    this.showActions = true;
                }
            });
    }
}

