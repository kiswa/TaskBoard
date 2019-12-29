import { Component, OnInit } from '@angular/core';

import { SettingsService } from '../settings.service';
import { UserSettingsService } from './user-settings.service';
import { PassForm, UsernameForm, EmailForm } from './user-settings.models';
import {
  ApiResponse,
  Board,
  Notification,
  User,
  UserOptions
} from '../../shared/models';
import {
  AuthService,
  NotificationsService,
  StringsService
} from '../../shared/services';

@Component({
  selector: 'tb-user-settings',
  templateUrl: './user-settings.component.html',
  providers: [ UserSettingsService ]
})
export class UserSettingsComponent implements OnInit {
  public boards: Array<Board>;
  public user: User;
  public userOptions: UserOptions;
  public changePassword: PassForm;
  public changeUsername: UsernameForm;
  public changeEmail: EmailForm;
  public strings: any;

  constructor(private auth: AuthService,
              private notes: NotificationsService,
              private settings: SettingsService,
              public users: UserSettingsService,
              public stringsService: StringsService) {
    this.user = new User();
    this.changeEmail = new EmailForm();

    this.boards = [];
    this.strings = {};

    auth.userChanged.subscribe(user => {
      if (!user) {
        return;
      }

      this.user = user;
      this.changeEmail.newEmail = user.email;
      this.userOptions = auth.userOptions;
    });

    stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
    });

    settings.boardsChanged.subscribe(boards => {
      this.boards = boards;
    });
  }

  ngOnInit() {
    this.resetForms();
  }

  onOptionChange(option: string, event: any) {
    switch (option) {
      case 'new_tasks':
        this.userOptions.new_tasks_at_bottom = event === 'true';
        break;

      case 'mult_tasks':
        this.userOptions.multiple_tasks_per_row = event;
        break;

      case 'show_anim':
        this.userOptions.show_animations = event;
        break;

      case 'show_assign':
        this.userOptions.show_assignee = event;
        break;

      case 'language':
        this.userOptions.language = event;
        break;
    }
    this.updateUserOptions();
  }

  updateUserOptions() {
    this.users.changeUserOptions(this.userOptions)
      .subscribe((response: ApiResponse) => {
        this.addAlerts(response.alerts);
      });
  }

  updateDefaultBoard(boardId: string) {
    this.user.default_board_id = parseInt(boardId, 10);

    this.users.changeDefaultBoard(this.user)
      .subscribe((response: ApiResponse) => {
        this.addAlerts(response.alerts);
        this.auth.updateUser(JSON.parse(response.data[1]));
      });
  }

  updatePassword() {
    this.changePassword.submitted = true;

    if (!this.validatePassForm()) {
      return;
    }

    this.users.changePassword(this.changePassword.current,
      this.changePassword.newPass)
      .subscribe((response: ApiResponse) => {
        this.addAlerts(response.alerts);
        this.resetPasswordForm();
        this.changePassword.submitted = false;

        if (response.status === 'success') {
          this.auth.updateUser(JSON.parse(response.data[1]));
        }
      });
  }

  updateUsername() {
    this.changeUsername.submitted = true;

    if (this.changeUsername.newName === '') {
      this.notes.add(new Notification('error',
        // tslint:disable-next-line
        this.strings['settings_usernameRequired']));
      this.changeUsername.submitted = false;

      return;
    }

    this.users.changeUsername(this.changeUsername.newName)
      .subscribe((response: ApiResponse) => {
        this.addAlerts(response.alerts);
        this.resetUsernameForm();
        this.changeUsername.submitted = false;

        this.settings.getBoards()
          .subscribe((res: ApiResponse) => {
            const boardData = res.data[1];
            const boards: Array<Board> = [];

            if (boardData) {
              boardData.forEach((board: any) => {
                boards.push(new Board(+board.id, board.name,
                  board.is_active === '1',
                  board.ownColumn,
                  board.ownCategory,
                  board.ownAutoAction,
                  board.ownIssuetracker,
                  board.sharedUser));
              });

              this.settings.updateBoards(boards);
            }
          });
      });
  }

  updateEmail() {
    this.changeEmail.submitted = true;

    // https://davidcel.is/posts/stop-validating-email-addresses-with-regex/
    const emailRegex = /.+@.+\..+/i;
    const match = this.changeEmail.newEmail.match(emailRegex);

    if (!match && this.changeEmail.newEmail !== '') {
      this.notes.add(new Notification('error', 'Invalid email address.'));
      this.changeEmail.submitted = false;

      return;
    }

    this.users.changeEmail(this.changeEmail.newEmail)
      .subscribe((response: ApiResponse) => {
        this.addAlerts(response.alerts);
        this.resetEmailForm();
        this.changeEmail.submitted = false;
      });
  }

  resetPasswordForm() {
    this.changePassword = new PassForm();
  }

  resetUsernameForm() {
    this.changeUsername = new UsernameForm();
  }

  resetEmailForm() {
    this.changeEmail = new EmailForm(this.user.email);
  }

  private addAlerts(alerts: Array<Notification>) {
    alerts.forEach(msg => {
      this.notes.add(msg);
    });
  }

  private resetForms() {
    this.resetPasswordForm();
    this.resetUsernameForm();
    this.resetEmailForm();
  }

  private validatePassForm() {
    if (this.changePassword.current === '' ||
        this.changePassword.newPass === '' ||
        this.changePassword.verPass === '') {
      this.notes.add(new Notification(
        'error',
        'All fields are required to change your password.'));
      this.changePassword.submitted = false;

      return false;
    }

    if (this.changePassword.newPass !== this.changePassword.verPass) {
      this.notes.add(new Notification(
        'error',
        'New password and verify password do not match.'));
      this.changePassword.submitted = false;

      return false;
    }

    return true;
  }
}

