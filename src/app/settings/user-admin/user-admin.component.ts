import { Component } from '@angular/core';

import { UserAdminService } from './user-admin.service';
import { SettingsService } from '../settings.service';
import {
  ApiResponse,
  Board,
  Notification,
  User
} from '../../shared/models';
import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from '../../shared/services';
import {
  UserDisplay,
  ModalUser,
  ModalProperties
} from './user-admin.models';

@Component({
  selector: 'tb-user-admin',
  templateUrl: './user-admin.component.html',
  providers: [ UserAdminService ]
})
export class UserAdmin {
  private users: Array<UserDisplay>;
  private userToRemove: UserDisplay;

  public boards: Array<Board>;
  public activeUser: User;
  public modalProps: ModalProperties;
  public strings: any;

  public loading = true;
  public saving = false;

  public MODAL_ID: string;
  public MODAL_CONFIRM_ID: string;

  constructor(private userService: UserAdminService,
              private notes: NotificationsService,
              private auth: AuthService,
              private settings: SettingsService,
              public modal: ModalService,
              private stringsService: StringsService) {
    this.MODAL_ID = 'user-addEdit-form';
    this.MODAL_CONFIRM_ID = 'user-remove-confirm';

    this.users = [];
    this.boards = [];
    this.modalProps = new ModalProperties(true, new ModalUser(new User()));

    auth.userChanged
      .subscribe(activeUser => {
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
        this.replaceUser(activeUser);
      });

    stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
    });

    settings.boardsChanged
      .subscribe(boards => {
        this.boards = boards;
      });

    settings.getUsers()
      .subscribe((response: ApiResponse) => {
        if (response.data[1]) {
          response.data[1].forEach((user: any) => {
            this.users.push(this.convertUser(user));
          });
        }

        this.getBoards();
      });
  }

  addEditUser(): void {
    let isAdd = this.modalProps.prefix;
    this.saving = true;

    if (!this.validateModalUser()) {
      this.saving = false;
      return;
    }

    if (isAdd) {
      this.userService.addUser(this.modalProps.user)
        .subscribe((response: ApiResponse) => {
          response.alerts.forEach(note => this.notes.add(note));

          this.replaceUserList(response);
          this.closeModal(response.status);
        });

      return;
    }

    this.userService.editUser(this.modalProps.user)
    .subscribe((response: ApiResponse) => {
      response.alerts.forEach(note => this.notes.add(note));

      this.replaceUser(JSON.parse(response.data[1]));
      this.closeModal(response.status);
    });
  }

  removeUser(): void {
    this.userService.removeUser(this.userToRemove.id)
    .subscribe((response: ApiResponse) => {
      response.alerts.forEach(note => this.notes.add(note));
      this.replaceUserList(response);

      if (response.status === 'success') {
        this.modal.close(this.MODAL_CONFIRM_ID);
        this.getBoards();
      }
    });
  }

  private closeModal(status: string): void {
    if (status === 'success') {
      this.modal.close(this.MODAL_ID);
      this.saving = false;

      this.getBoards();
    }
  }

  private getBoards(): void {
    this.settings.getBoards()
    .subscribe((response: ApiResponse) => {
      let boards = response.data[1];
      this.boards = [];

      if (boards) {
        boards.forEach((board: any) => {
          this.boards.push(new Board(+board.id, board.name,
            board.is_active === '1',
            board.ownColumn,
            board.ownCategory,
            board.ownAutoAction,
            board.ownIssuetracker,
            board.sharedUser));
        });
      }

      this.settings.updateBoards(this.boards);

      this.updateUserList();
      this.getActions();
    });
  }

  private getActions(): void {
    this.settings.getActions()
    .subscribe((response: ApiResponse) => {
      this.settings.updateActions(response.status === 'success'
        ? response.data[1]
        : []);
      this.loading = false;
    });
  }

  private convertUser(user: any): UserDisplay {
    return new UserDisplay(+user.default_board_id, user.email,
      +user.id, user.last_login, +user.security_level,
      +user.user_option_id, user.username,
      user.board_access);
  }

  private replaceUser(newUser: User) {
    this.users.forEach((user, index) => {
      if (+user.id === +newUser.id) {
        this.users[index] = this.convertUser(newUser);
        this.updateUserList();
      }
    });
  }

  private replaceUserList(response: ApiResponse): void {
    if (response.status === 'success') {
      this.users = [];

      response.data[1].forEach((user: any) => {
        this.users.push(this.convertUser(user));
      });

      this.updateUserList();
    }
  }

  private validateModalUser(): boolean {
    let user = this.modalProps.user;

    if (user.username === '') {
      this.notes.add(
        new Notification('error', this.strings.settings_usernameRequired));
      return false;
    }

    if (this.modalProps.prefix && user.password === '') {
      this.notes.add(
        new Notification('error', this.strings.settings_passwordRequired));
      return false;
    }

    if (user.password !== user.password_verify) {
      this.notes.add(
        new Notification('error', this.strings.settings_verifyError));
      return false;
    }

    let emailRegex = /.+@.+\..+/i;
    let match = user.email.match(emailRegex);

    if (!match && user.email !== '') {
      this.notes.add(
        new Notification('error', this.strings.settings_emailError));
      return false;
    }

    return true;
  }

  private showModal(isAdd: boolean = true, user?: UserDisplay): void {
    this.modalProps = {
      prefix: isAdd,
      user: isAdd ? new ModalUser(new User()) : new ModalUser(user)
    };

    this.modal.open(this.MODAL_ID);
  }

  private showConfirmModal(user: UserDisplay): void {
    this.userToRemove = user;
    this.modal.open(this.MODAL_CONFIRM_ID);
  }

  private getDefaultBoardName(user: UserDisplay): string {
    let filtered = this.boards
      .filter(board => board.id === user.default_board_id);

    if (filtered.length) {
      return filtered[0].name;
    }

    return this.strings.none;
  }

  private updateUserList(): void {
    this.users.forEach((user: UserDisplay) => {
      user.default_board_name = this.getDefaultBoardName(user);
      user.security_level_name = +user.security_level === 1
        ? this.strings.settings_admin
        : +user.security_level === 2
        ? this.strings.settings_boardAdmin
        : this.strings.settings_user;
      user.can_admin = true;

      if (+user.id === +this.activeUser.id ||
        +this.activeUser.security_level === 3) {
        user.can_admin = false;
      }
    });

    this.settings.updateUsers(<Array<User>> this.users);
  }
}

