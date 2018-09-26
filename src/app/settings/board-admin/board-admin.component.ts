import { Component, OnDestroy } from '@angular/core';

import { DragulaService } from 'ng2-dragula/dist';

import {
  ApiResponse,
  Board,
  Column,
  User,
  Notification
} from '../../shared/models';
import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from '../../shared/services';
import { SettingsService } from '../settings.service';
import { BoardAdminService } from './board-admin.service';
import { BoardData } from './board-data.model';

class SelectableUser extends User {
  public selected: boolean;
}

@Component({
  selector: 'tb-board-admin',
  templateUrl: './board-admin.component.html',
  providers: [ BoardAdminService ]
})
export class BoardAdmin implements OnDestroy {
  private noBoardsMessage: string;

  private firstRun = true;
  private subs: Array<any>;

  public displayBoards: Array<Board>;
  public users: Array<User>;
  public boards: Array<Board>;
  public activeUser: User;
  public modalProps: BoardData;
  public boardToRemove: Board;
  public strings: any;

  public hasBAUsers = false;
  public loading = true;
  public saving = false;

  public userFilter: string;
  public statusFilter: string;
  public sortFilter: string;

  public MODAL_ID: string;
  public MODAL_CONFIRM_ID: string;

  constructor(private auth: AuthService,
              public modal: ModalService,
              public settings: SettingsService,
              public boardService: BoardAdminService,
              private notes: NotificationsService,
              private stringsService: StringsService,
              public dragula: DragulaService) {
    this.MODAL_ID = 'board-addedit-form';
    this.MODAL_CONFIRM_ID = 'board-remove-confirm';

    this.users = [];
    this.boards = [];
    this.displayBoards = [];
    this.subs = [];

    this.modalProps = new BoardData();
    this.activeUser = new User();

    this.userFilter = '-1'; // Any User
    this.statusFilter = '-1'; // Any active status
    this.sortFilter = 'name-asc';

    let sub = auth.userChanged.subscribe((user: User) => {
      this.updateActiveUser(user);
    });
    this.subs.push(sub);

    sub = settings.usersChanged.subscribe((users: Array<User>) => {
      this.updateUsersList(users);
    });
    this.subs.push(sub);

    sub = settings.boardsChanged.subscribe((boards: Array<Board>) => {
      this.updateBoardsList(boards);
    });
    this.subs.push(sub);

    sub = stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
      this.updateActiveUser(this.activeUser);
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  ngAfterContentInit() {
    let ul = document.getElementsByClassName('modal-list')[0];
    let bag = this.dragula.find('columns-bag');

    if (bag !== undefined) {
      this.dragula.destroy('columns-bag');
    }

    this.dragula.createGroup('columns-bag', <any>{
      moves: (el: any, container: any, handle: any) => {
        return handle.classList.contains('icon-resize-vertical');
      },
      mirrorContainer: ul
    });

    this.dragula.dragend('columns-bag').subscribe(() => {
      this.modalProps.columns.forEach((item, index) => {
        item.position = '' + index;
      });
    });
  }

  addEditBoard(): void {
    if (!this.modal.isOpen(this.MODAL_ID)) {
      return;
    }

    let isAdd = this.modalProps.title === 'Add';

    this.saving = true;
    this.setBoardUsers();

    if (!this.validateBoard()) {
      this.saving = false;
      return;
    }

    if (isAdd) {
      this.boardService.addBoard(this.modalProps)
        .subscribe((response: ApiResponse) => {
          this.handleResponse(response);
        });
      return;
    }

    this.boardService.editBoard(this.modalProps)
      .subscribe((response: ApiResponse) => {
        this.handleResponse(response);
      });
  }

  removeBoard(): void {
    this.saving = true;

    this.boardService.removeBoard(this.boardToRemove.id)
    .subscribe((response: ApiResponse) => {
      this.handleResponse(response);

      this.settings.getActions()
        .subscribe((res: ApiResponse) => {
          this.settings.updateActions(res.data[1]);
        });
    });
  }

  toggleBoardStatus(board: Board): void {
    let boardData = new BoardData('', board.id, board.name,
      !board.is_active, board.columns,
      board.categories, board.issue_trackers,
      board.users);

    this.boardService.editBoard(boardData)
    .subscribe((response: ApiResponse) => {
      this.handleResponse(response);
    });
  }

  filterBoards(): void {
    let userBoards = this.filterBoardsByUser(),
    statusBoards = this.filterBoardsByStatus();

    this.displayBoards = [];

    this.boards.forEach((board: Board) => {
      let foundInUserBoards = false,
        foundInStatusBoards = false;

      userBoards.forEach((userBoard: Board) => {
        if (userBoard.id === board.id) {
          foundInUserBoards = true;
        }
      });

      statusBoards.forEach((statusBoard: Board) => {
        if (statusBoard.id === board.id) {
          foundInStatusBoards = true;
        }
      });

      if (foundInUserBoards && foundInStatusBoards) {
        this.displayBoards.push(board);
      }
    });

    // Always sort the filtered boards
    this.sortBoards();
  }

  cancelEnterKey(event: any): void {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  private sortBoards(): void {
    switch (this.sortFilter) {
      case 'name-asc':
        this.displayBoards.sort((a: Board, b: Board) => {
          return a.name.localeCompare(b.name);
        });
        break;

      case 'name-desc':
        this.displayBoards.sort((a: Board, b: Board) => {
          return b.name.localeCompare(a.name);
        });
        break;

      case 'id-desc':
        this.displayBoards.sort((a: Board, b: Board) => {
          return b.id - a.id;
        });
        break;

      case 'id-asc':
        this.displayBoards.sort((a: Board, b: Board) => {
          return a.id - b.id;
        });
        break;
    }
  }

  private filterBoardsByUser(): Array<Board> {
    if (+this.userFilter === -1) {
      return this.deepCopy(this.boards);
    }

    let filteredBoards: Array<Board> = [];

    this.boards.forEach((board: Board) => {
      let userFound = false;

      board.users.forEach(user => {
        if (+user.id === +this.userFilter) {
          userFound = true;
        }
      });

      if (userFound) {
        filteredBoards.push(board);
      }
    });

    return filteredBoards;
  }

  private filterBoardsByStatus(): Array<Board> {
    if (+this.statusFilter === -1) {
      return this.deepCopy(this.boards);
    }

    let filteredBoards: Array<Board> = [];

    this.boards.forEach((board: Board) => {
      if ((board.is_active && +this.statusFilter === 1) ||
        (!board.is_active && +this.statusFilter === 0)) {

        filteredBoards.push(board);
      }
    });

    return filteredBoards;
  }

  private validateBoard(): boolean {
    if (this.modalProps.name === '') {
      this.notes.add(
        new Notification('error', this.strings.settings_boardNameError));
      return false;
    }

    if (this.modalProps.columns.length === 0) {
      this.notes.add(
        new Notification('error', this.strings.settings_columnError));
      return false;
    }

    return true;
  }

  private handleResponse(response: ApiResponse): void {
    response.alerts.forEach(note => this.notes.add(note));

    if (response.status === 'success') {
      this.modal.close(this.MODAL_ID);
      this.modal.close(this.MODAL_CONFIRM_ID);

      let boards = Array<Board>();
      response.data[1].forEach((board: any) => {
        boards.push(new Board(+board.id, board.name,
          board.is_active === '1', board.ownColumn,
          board.ownCategory, board.ownAutoAction,
          board.ownIssuetracker, board.sharedUser));
      });

      this.settings.updateBoards(boards);
      this.saving = false;
    }
  }

  private setBoardUsers(): void {
    this.modalProps.users = [];

    this.users.forEach((user: SelectableUser) => {
      if (user.selected) {
        this.modalProps.users.push(user);
      }
    });
  }

  private updateActiveUser(activeUser: User): void {
    if (!activeUser) {
      return;
    }

    this.activeUser = new User(+activeUser.default_board_id,
      activeUser.email,
      +activeUser.id,
      activeUser.last_login,
      +activeUser.security_level,
      +activeUser.user_option_id,
      activeUser.username,
      activeUser.board_access);

    if (!this.strings) {
      return;
    }

    this.noBoardsMessage = this.strings.settings_noBoards;

    if (+activeUser.security_level === 1) {
      this.noBoardsMessage = this.strings.settings_noBoardsAdmin;
    }
  }

  private updateUsersList(users: Array<any>): void {
    this.users = [];
    this.hasBAUsers = false;

    users.forEach(user => {
      // Don't include admin users
      if (user.security_level > 1) {
        this.users.push(user);

        if (user.security_level === 2) {
          this.hasBAUsers = true;
        }
      }
    });
  }

  private updateBoardsList(boards: Array<Board>): void {
    this.boards = boards;

    this.boards.forEach(board => {
      board.columns.sort((a: Column, b: Column) => {
        return +a.position - +b.position;
      });
    });

    this.displayBoards = this.deepCopy(this.boards);
    this.filterBoards();

    if (this.firstRun) {
      this.firstRun = false;
      return;
    }

    this.loading = false;
  }

  private getPropertyValue(obj: string, prop: string, i: number): string {
    return this.modalProps[obj][i][prop];
  }

  private onPropertyEdit(obj: string, prop: string,
                         i: number, value: any): void {
    this.modalProps[obj][i][prop] = value;
  }

  private getColor(category: any): string {
    if (category.default_task_color) {
      return category.default_task_color;
    }

    return category.defaultColor;
  }

  private setCategoryColor(color: any, index: number): void {
    this.modalProps.categories[index].default_task_color = color;
  }

  private deepCopy(source: any): any {
    let output: any, value: any, key: any;

    output = Array.isArray(source) ? [] : {};

    for (key in source) {
      if (source.hasOwnProperty(key)) {
        value = source[key];
        output[key] = (typeof value === 'object') ?
          this.deepCopy(value) : value;
      }
    }

    return output;
  }

  private showModal(title: string, board?: Board): void {
    let isAdd = (title === 'Add');

    this.modalProps = new BoardData(title);

    if (isAdd) {
      this.users.forEach((user: SelectableUser) => {
        user.selected = false;
      });
    } else {
      this.modalProps.id = board.id;
      this.modalProps.name = board.name;
      this.modalProps.columns = this.deepCopy(board.columns);
      this.modalProps.categories = this.deepCopy(board.categories);
      this.modalProps.issue_trackers = this.deepCopy(board.issue_trackers);

      this.users.forEach((user: SelectableUser) => {
        let filtered = board.users.filter(u => +u.id === user.id);

        user.selected = filtered.length > 0;
      });
    }

    this.modal.open(this.MODAL_ID);
  }

  private showConfirmModal(board: Board): void {
    this.boardToRemove = board;
    this.modal.open(this.MODAL_CONFIRM_ID);
  }
}

