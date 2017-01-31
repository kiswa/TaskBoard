import { Component } from '@angular/core';

import { AutoActionsService } from './auto-actions.service';

import {
    ApiResponse,
    AutoAction,
    User,
    Board,
    Modal,
    Notification,
    AuthService,
    ModalService,
    NotificationsService
} from '../../shared/index';
import { SettingsService } from '../settings.service';

@Component({
    selector: 'tb-auto-actions',
    templateUrl: 'app/settings/auto-actions/auto-actions.component.html',
    providers: [ AutoActionsService ]
})
export class AutoActions {
    private activeUser: User;
    private showActions: boolean;
    private boards: Array<Board>;
    private autoActions: Array<AutoAction>;

    constructor(private auth: AuthService,
                private modal: ModalService,
                private settings: SettingsService,
                private notes: NotificationsService,
                private actions: AutoActionsService) {
        this.showActions = false;
        this.boards = [];
        this.autoActions = [];

        auth.userChanged
            .subscribe(activeUser => {
                this.updateActiveUser(activeUser);
            });

        settings.boardsChanged.subscribe((boards: Array<Board>) => {
            this.boards = boards;
        });

        actions.getActions()
            .subscribe((response: ApiResponse) => {
                this.autoActions = response.data[1];
            });
    }

    private updateActiveUser(activeUser: User) {
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
    }
}

