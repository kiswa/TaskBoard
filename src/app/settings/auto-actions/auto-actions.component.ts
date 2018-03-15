import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import {
  ApiResponse,
  AutoAction,
  ActionTrigger,
  ActionType,
  User,
  Board,
  Notification
} from '../../shared/models';
import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from '../../shared/services';
import { SettingsService } from '../settings.service';
import { AutoActionsService } from './auto-actions.service';

@Component({
  selector: 'tb-auto-actions',
  templateUrl: './auto-actions.component.html',
  providers: [ AutoActionsService ]
})
export class AutoActions {
  private noActionsMessage: string;

  private actionToRemove: AutoAction;
  private newAction: AutoAction;

  private boards: Array<Board>;
  private autoActions: Array<AutoAction>;

  private triggers: Array<Array<any>>;
  private triggerSources: Array<Array<any>>;
  private types: Array<Array<any>>;
  private typesList: Array<Array<any>>;
  private actionSources: Array<Array<any>>;

  private firstRun = true;
  private isAddDisabled = true;

  public MODAL_CONFIRM_ID: string;
  public activeUser: User;
  public strings: any;

  public saving = false;
  public loading = true;
  public hasInactiveBoards = false;

  constructor(private auth: AuthService,
              public modal: ModalService,
              private settings: SettingsService,
              private actions: AutoActionsService,
              private notes: NotificationsService,
              private stringsService: StringsService,
              private sanitizer: DomSanitizer) {
    this.newAction = new AutoAction();
    this.boards = [];
    this.autoActions = [];
    this.MODAL_CONFIRM_ID = 'action-remove-confirm';
    this.strings = {};

    auth.userChanged
      .subscribe(activeUser => {
        this.updateActiveUser(activeUser);
      });

    settings.boardsChanged
      .subscribe((boards: Array<Board>) => {
        this.boards = boards;
        this.updateHasInactiveBoards();
      });

    settings.actionsChanged
      .subscribe((actionList: Array<AutoAction>) => {
        this.autoActions = actionList;
        this.updateHasInactiveBoards();

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

    stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;

      this.triggers = [
        [
          ActionTrigger.MovedToColumn,
          this.strings.settings_triggerMoveToColumn
        ],
        [
          ActionTrigger.AssignedToUser,
          this.strings.settings_triggerAssignedToUser
        ],
        [
          ActionTrigger.AddedToCategory,
          this.strings.settings_triggerAddedToCategory
        ],
        [
          ActionTrigger.PointsChanged,
          this.strings.settings_triggerPointsChanged
        ]
      ];

      this.typesList = [
        [
          ActionType.SetColor,
          this.strings.settings_actionSetColor
        ],
        [
          ActionType.SetCategory,
          this.strings.settings_actionSetCategory
        ],
        [
          ActionType.AddCategory,
          this.strings.settings_actionAddCategory
        ],
        [
          ActionType.SetAssignee,
          this.strings.settings_actionSetAssignee
        ],
        [
          ActionType.AddAssignee,
          this.strings.settings_actionAddAssignee
        ],
        [
          ActionType.ClearDueDate,
          this.strings.settings_actionClearDueDate
        ]
      ];

      this.types = this.typesList;
      this.updateTriggerSources();
      this.updateActionSources();
      this.updateActiveUser(this.activeUser);
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
        this.types = [ [
          ActionType.AlterColorByPoints,
          this.strings.settings_alterByPoints
        ] ];
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

      return board.name + note;
    }

    return '';
  }

  getTriggerDescription(action: AutoAction): string {
    let desc = '',
      board = this.getBoard(action.board_id);

    if (!board) {
      return;
    }

    switch (+action.trigger) {
      case ActionTrigger.MovedToColumn:
        desc = this.strings.settings_triggerMoveToColumn + ' ';
        desc += this.getNameFromArray(board.columns, action.source_id);
        break;
      case ActionTrigger.AssignedToUser:
        desc = this.strings.settings_triggerAssignedToUser + ' ';
        desc += this.getNameFromArray(board.users,
          action.source_id, 'username');
        break;
      case ActionTrigger.AddedToCategory:
        desc = this.strings.settings_triggerAddedToCategory + ' ';
        desc += this.getNameFromArray(board.categories,
          action.source_id);
        break;
      case ActionTrigger.PointsChanged:
        desc = this.strings.settings_triggerPointsChanged;
        break;
    }

    return desc;
  }

  getTypeDescription(action: AutoAction): SafeHtml {
    let desc = '',
      board = this.getBoard(action.board_id);

    if (!board) {
      return;
    }

    switch (+action.type) {
      case ActionType.SetColor:
        desc = this.strings.settings_actionSetColor + ' <span style="background-color: ' +
          action.change_to + ';">' + action.change_to + '</span>';
        break;
      case ActionType.SetCategory:
        desc = this.strings.settings_actionSetCategory + ' ';
        desc += this.getNameFromArray(board.categories,
          +action.change_to);
        break;
      case ActionType.AddCategory:
        desc = this.strings.settings_actionAddCategory + ' ';
        desc += this.getNameFromArray(board.categories,
          +action.change_to);
        break;
      case ActionType.SetAssignee:
        desc = this.strings.settings_actionSetAssignee + ' ';
        desc += this.getNameFromArray(board.users,
          +action.change_to, 'username');
        break;
      case ActionType.AddAssignee:
        desc = this.strings.settings_actionAddAssignee + ' ';
        desc += this.getNameFromArray(board.users,
          +action.change_to, 'username');
        break;
      case ActionType.ClearDueDate:
        desc = this.strings.settings_actionClearDueDate;
        break;
      case ActionType.AlterColorByPoints:
        desc = this.strings.settings_actionAlterColor;
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

  private updateHasInactiveBoards(): void {
    this.hasInactiveBoards = false;

    this.boards.forEach(board => {
      if (!(+board.is_active)) {
        this.hasInactiveBoards = true;
      }
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
      this[sourceArray] =
      [ [ null, this.strings['settings_select' + name ] ] ]; // tslint:disable-line

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
    this.noActionsMessage = this.strings.settings_noActions;

    if (activeUser.security_level < 3) {
      this.noActionsMessage = this.strings.settings_noActionsAdmin;
    }
  }

  private showConfirmModal(action: AutoAction): void {
    this.actionToRemove = action;
    this.modal.open(this.MODAL_CONFIRM_ID);
  }
}

