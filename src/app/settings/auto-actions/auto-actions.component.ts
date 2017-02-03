import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    private hasInactiveBoards = false;

    constructor(private auth: AuthService,
                private modal: ModalService,
                private settings: SettingsService,
                private actions: AutoActionsService,
                private notes: NotificationsService,
                private sanitizer: DomSanitizer) {
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
                this.hasInactiveBoards = false;

                this.autoActions.sort((a, b) => {
                    let nameA = this.getBoardName(a.board_id),
                        nameB = this.getBoardName(b.board_id);

                    return nameA.localeCompare(nameB);
                });

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
                this.handleResponse(response);

                this.newAction = new AutoAction();
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
                (this.newAction.type !== ActionType.ClearDueDate);
        }
    }

    getBoardName(id: number): string {
        let board = this.getBoard(+id);

        if (board) {
            let note = +board.is_active ? '' : '*';

            if (!(+board.is_active)) {
                this.hasInactiveBoards = true;
            }

            return board.name + note;
        }

        return '';
    }

    getTriggerDescription(action: AutoAction): string {
        let desc = 'Item ',
            board = this.getBoard(action.board_id);

        switch (+action.trigger) {
            case ActionTrigger.MovedToColumn:
                desc += 'moves to column: ';
                desc += this.getNameFromArray(board.columns, action.source_id);
            break;
            case ActionTrigger.AssignedToUser:
                desc += 'assigned to user: ';
                desc += this.getNameFromArray(board.users,
                                              action.source_id, 'username');
            break;
            case ActionTrigger.AddedToCategory:
                desc += 'added to category: ';
                desc += this.getNameFromArray(board.categories,
                                              action.source_id);
            break;
            case ActionTrigger.PointsChanged:
                desc += 'points changed.';
            break;
        }

        return desc;
    }

    getTypeDescription(action: AutoAction): SafeHtml {
        let desc = '',
            board = this.getBoard(action.board_id);

        switch (+action.type) {
            case ActionType.SetColor:
                desc = 'Set item color: <span style="color: ' +
                    action.change_to + '";>' + action.change_to + '</span>';
            break;
            case ActionType.SetCategory:
                desc = 'Set item category: ';
                desc += this.getNameFromArray(board.categories,
                                              +action.change_to);
            break;
            case ActionType.AddCategory:
                desc = 'Add item category: ';
                desc += this.getNameFromArray(board.categories,
                                              +action.change_to);
            break;
            case ActionType.SetAssignee:
                desc = 'Set item assignee: ';
                desc += this.getNameFromArray(board.users,
                                              +action.change_to, 'username');
            break;
            case ActionType.AddAssignee:
                desc = 'Add item assignee: ';
                desc += this.getNameFromArray(board.users,
                                              +action.change_to, 'username');
            break;
            case ActionType.ClearDueDate:
                desc = 'Clear item due date.';
            break;
            case ActionType.AlterColorByPoints:
                desc = 'Alter item color by points.';
            break;
        }

        return this.sanitizer.bypassSecurityTrustHtml(desc);
    }

    removeAutoAction(): void {
        this.saving = true;

        this.actions.removeAction(this.actionToRemove)
            .subscribe((response: ApiResponse) => {
                this.handleResponse(response);
            });
    }

    private handleResponse(response: ApiResponse): void {
        response.alerts.forEach(alert => {
            this.notes.add(alert);
        });

        this.settings.updateActions(response.data[1]);
        this.saving = false;
        this.modal.close(this.MODAL_CONFIRM_ID);
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
            if (+this.boards[i].id === +id) {
                board = this.boards[i];
                break;
            }
        }

        return board;
    }

    private getNameFromArray(boardArray: Array<any>,
                             arrayItemId: number,
                             prop: string = 'name') {
        let name = '';

        boardArray.forEach(item => {
            if (+item.id !== +arrayItemId) {
                return;
            }

            name = item[prop];
        });

        return name;
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

