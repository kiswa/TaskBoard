import { Component } from '@angular/core';

import {
    ApiResponse,
    AutoAction,
    ActionTrigger,
    ActionType,
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
    templateUrl: 'app/settings/auto-actions/auto-actions.component.html'
})
export class AutoActions {
    private noActionsMessage: string;
    private MODAL_CONFIRM_ID: string;
    private activeUser: User;
    private actionToRemove: AutoAction;
    private newAction: AutoAction;

    private boards: Array<Board>;
    private autoActions: Array<AutoAction>;

    private triggers: Array<Array<any>>;
    private triggerSources: Array<Array<any>>;
    private types: Array<Array<any>>;

    private loading = true;
    private firstRun = true;
    private saving = false;

    constructor(private auth: AuthService,
                private modal: ModalService,
                private settings: SettingsService,
                private notes: NotificationsService) {
        this.newAction = new AutoAction();
        this.boards = [];
        this.autoActions = [];
        this.MODAL_CONFIRM_ID = 'action-remove-confirm';

        this.triggers = [
            [ ActionTrigger.MoveToColumn, 'Item moves to column' ],
            [ ActionTrigger.AssignedToUser, 'Item assigned to user' ],
            [ ActionTrigger.SetToCategory, 'Item set to category' ],
            [ ActionTrigger.PointsChanged, 'Item points change' ]
        ];
        this.updateTriggerSources();
        this.types = [
            [ ActionType.SetColor, 'Set item color'],
            [ ActionType.SetCategory, 'Set item category' ],
            [ ActionType.SetAssignee, 'Set item assignee' ],
            [ ActionType.ClearDueDate, 'Clear item due date' ],
            [ ActionType.UseBaseColor, 'Dim item color by points' ]
        ];

        auth.userChanged
            .subscribe(activeUser => {
                this.updateActiveUser(activeUser);
            });

        settings.boardsChanged
            .subscribe((boards: Array<Board>) => {
                this.boards = boards;
            });

        settings.actionsChanged
            .subscribe((actions: Array<AutoAction>) => {
                this.autoActions = actions;

                if (this.firstRun) {
                    this.firstRun = false;
                    return;
                }

                this.loading = false;
            });
    }

    updateTriggerSources(): void {
        this.triggerSources = [];

        switch (this.newAction.trigger) {
            case ActionTrigger.MoveToColumn:
                this.triggerSources = [ [ null, 'Select Column' ] ];

                for (let i = 0; i < this.boards.length; ++i) {
                    if (this.boards[i].id !== +this.newAction.board_id) {
                        continue;
                    }

                    this.boards[i].columns.forEach(column => {
                        this.triggerSources.push([ column.id, column.name ]);
                    });
                }
            break;
            case ActionTrigger.AssignedToUser:
            break;
            case ActionTrigger.SetToCategory:
            break;
            case ActionTrigger.PointsChanged:
                // Leave it empty
            break;
        }
    }

    private removeAutoAction(): void {
        this.saving = true;
        // TODO remove this.actionToRemove
        this.saving = false;
    }

    private getBoardName(id: number): string {
        let board = this.getBoard(id);

        return board ? board.name : '';
    }

    private getTriggerDescription(action: AutoAction): string {
        let desc = '';

        return desc;
    }

    private getTypeDescription(action: AutoAction): string {
        let desc = '';

        return desc;
    }

    private getBoard(id: number): Board {
        let board: Board = null;

        for (let i = 0; i < this.boards.length; ++i) {
            if (this.boards[i].id === id) {
                board = this.boards[i];
                break;
            }
        }

        return board;
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
        this.noActionsMessage = 'There are no current automatic actions. ' +
            'Use the Add Action form below to add one.';

        if (+activeUser.security_level === 3) {
            this.noActionsMessage = 'There are no automatic actions. ' +
                'Contact an admin user to create one.';
        }
    }

    private showConfirmModal(action: AutoAction): void {
        this.actionToRemove = action;
        this.modal.open(this.MODAL_CONFIRM_ID);
    }
}

