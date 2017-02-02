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
import { AutoActionsService } from './auto-actions.service';

@Component({
    selector: 'tb-auto-actions',
    templateUrl: 'app/settings/auto-actions/auto-actions.component.html',
    providers: [ AutoActionsService ]
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
    private typesList: Array<Array<any>>;
    private actionSources: Array<Array<any>>;

    private loading = true;
    private firstRun = true;
    private isAddDisabled = true;
    private saving = false;

    constructor(private auth: AuthService,
                private modal: ModalService,
                private settings: SettingsService,
                private actions: AutoActionsService,
                private notes: NotificationsService) {
        this.newAction = new AutoAction();
        this.boards = [];
        this.autoActions = [];
        this.MODAL_CONFIRM_ID = 'action-remove-confirm';

        this.triggers = [
            [ ActionTrigger.MovedToColumn, 'Item moved to column' ],
            [ ActionTrigger.AssignedToUser, 'Item assigned to user' ],
            [ ActionTrigger.AddedToCategory, 'Item added to category' ],
            [ ActionTrigger.PointsChanged, 'Item points change' ]
        ];
        this.updateTriggerSources();
        this.typesList = [
            [ ActionType.SetColor, 'Set item color'],
            [ ActionType.SetCategory, 'Set item category' ],
            [ ActionType.AddCategory, 'Add item category' ],
            [ ActionType.ClearAllCategories, 'Clear item categories' ],
            [ ActionType.SetAssignee, 'Set item assignee' ],
            [ ActionType.AddAssignee, 'Add item assignee' ],
            [ ActionType.ClearDueDate, 'Clear item due date' ]
        ];
        this.types = this.typesList;

        auth.userChanged
            .subscribe(activeUser => {
                this.updateActiveUser(activeUser);
            });

        settings.boardsChanged
            .subscribe((boards: Array<Board>) => {
                this.boards = boards;
            });

        settings.actionsChanged
            .subscribe((actionList: Array<AutoAction>) => {
                this.autoActions = actionList;

                if (this.firstRun) {
                    this.firstRun = false;
                    return;
                }

                this.loading = false;
            });
    }

    addNewAction(): void {
        this.actions.addAction(this.newAction)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(alert => {
                    this.notes.add(alert);
                });
            });
    }

    updateTriggerSources(): void {
        this.triggerSources = [];
        this.newAction.source_id = null;
        this.newAction.change_to = '#000000';

        this.types = this.typesList;

        switch (this.newAction.trigger) {
            case ActionTrigger.MovedToColumn:
                this.buildSourcesArray('triggerSources',
                                       'Column', 'columns');
            break;
            case ActionTrigger.AssignedToUser:
                this.buildSourcesArray('triggerSources',
                                       'User', 'users', 'username');
            break;
            case ActionTrigger.AddedToCategory:
                this.buildSourcesArray('triggerSources',
                                       'Category', 'categories');
            break;
            case ActionTrigger.PointsChanged:
                // Leave triggerSources empty
                this.types = [
                    [ ActionType.AlterColorByPoints, 'Alter color by points' ]
                ];
            break;
        }

        this.newAction.type = this.types ?
            this.types[0][0] : ActionType.SetColor;

        this.checkAddDisabled();
    }

    updateActionSources(): void {
        this.actionSources = [];
        this.newAction.change_to = null;

        switch (this.newAction.type) {
            case ActionType.SetCategory:
            case ActionType.AddCategory:
                this.buildSourcesArray('actionSources',
                                       'Category', 'categories');
            break;
            case ActionType.SetAssignee:
            case ActionType.AddAssignee:
                this.buildSourcesArray('actionSources',
                                       'Assignee', 'users', 'username');
            break;
            case ActionType.SetColor:
                this.newAction.change_to = '#000000';
            break;
        }

        this.checkAddDisabled();
    }

    checkAddDisabled(): void {
        this.isAddDisabled = false;

        if (this.newAction.board_id === null) {
            this.isAddDisabled = true;
            return;
        }

        if (this.newAction.source_id === null) {
            this.isAddDisabled =
                (this.newAction.trigger !== ActionTrigger.PointsChanged);
        }

        if (!this.isAddDisabled && this.newAction.change_to === null) {
            this.isAddDisabled =
                (this.newAction.type !== ActionType.ClearAllCategories &&
                 this.newAction.type !== ActionType.ClearDueDate);
        }
    }

    getBoardName(id: number): string {
        let board = this.getBoard(+id);

        return board ? board.name : '';
    }

    getTriggerDescription(action: AutoAction): string {
        let desc = '';

        return desc;
    }

    getTypeDescription(action: AutoAction): string {
        let desc = '';

        return desc;
    }

    removeAutoAction(): void {
        this.saving = true;

        this.actions.removeAction(this.actionToRemove)
            .subscribe((response: ApiResponse) => {
                this.actions = response.data[1];
                this.saving = false;
                this.modal.close(this.MODAL_CONFIRM_ID);
            });
    }

    private buildSourcesArray(sourceArray: string,
                              name: string,
                              arrayName: string,
                              prop: string = 'name'): void {
        this[sourceArray] = [ [ null, 'Select ' + name ] ];

        for (let i = 0; i < this.boards.length; ++i) {
            if (this.boards[i].id !== this.newAction.board_id) {
                continue;
            }

            this.boards[i][arrayName].forEach((item: any) => {
                this[sourceArray].push([ item.id, item[prop] ]);
            });
        }
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

        if (activeUser.security_level === 3) {
            this.noActionsMessage = 'There are no automatic actions. ' +
                'Contact an admin user to create one.';
        }
    }

    private showConfirmModal(action: AutoAction): void {
        this.actionToRemove = action;
        this.modal.open(this.MODAL_CONFIRM_ID);
    }
}

