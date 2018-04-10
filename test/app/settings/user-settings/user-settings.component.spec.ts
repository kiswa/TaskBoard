import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from '../../../../src/app/shared/services';
import { SettingsService } from '../../../../src/app/settings/settings.service';
import {
  UserSettingsService
} from '../../../../src/app/settings/user-settings/user-settings.service';
import { User } from '../../../../src/app/shared/models';
import { SettingsServiceMock, AuthServiceMock } from '../../mocks';

import {
  UserSettings
} from '../../../../src/app/settings/user-settings/user-settings.component';

describe('UserSettings', () => {
  let component: UserSettings,
    fixture: ComponentFixture<UserSettings>;

  const getPrivateFunction = name => component[name].bind(component);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule
      ],
      declarations: [
        UserSettings
      ],
      providers: [
        NotificationsService,
        StringsService,
        UserSettingsService,
        { provide: SettingsService, useClass: SettingsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('updates user options and calls a service', () => {
    let called = false;

    (<any>component.users).changeUserOptions = () => {
      return { subscribe: fn => {
        fn({ alerts: [{}] });
        called = true;
      } };
    };

    component.onOptionChange('new_tasks', 'true');

    expect(called).toEqual(true);
    expect(component.userOptions.new_tasks_at_bottom).toEqual(true);

    called = false;
    component.onOptionChange('mult_tasks', true);

    expect(called).toEqual(true);
    expect(component.userOptions.multiple_tasks_per_row).toEqual(true);

    called = false;
    component.onOptionChange('show_anim', true);

    expect(called).toEqual(true);
    expect(component.userOptions.show_animations).toEqual(true);

    called = false;
    component.onOptionChange('show_assign', true);

    expect(called).toEqual(true);
    expect(component.userOptions.show_assignee).toEqual(true);

    called = false;
    component.onOptionChange('language', 'es');

    expect(called).toEqual(true);
    expect(component.userOptions.language).toEqual('es');
  });

  it('calls a service to update a user\'s default board', () => {
    let called = false;

    (<any>component.users).changeDefaultBoard = () => {
      return { subscribe: fn => {
        fn({ alerts: [], data: [{}, '{}'] });
        called = true;
      } };
    };

    component.updateDefaultBoard('2');

    expect(component.user.default_board_id).toEqual(2);
    expect(called).toEqual(true);
  });

  it('calls a service to update a user\'s password', () => {
    let called = false;

    (<any>component.users).changePassword = () => {
      return { subscribe: fn => {
        fn({ alerts: [], data: [{}, '{}'] });
        called = true;
      } };
    };

    component.updatePassword();
    expect(called).toEqual(false);

    component.changePassword = <any>{ current: 'test', newPass: 'tester', verPass: 'test' };
    component.updatePassword();
    expect(called).toEqual(false);

    component.changePassword = <any>{ current: 'test', newPass: 'tester', verPass: 'tester' };
    component.updatePassword();

    expect(called).toEqual(true);
  });

  it('calls a service to update a user\'s username', () => {
    let called = false;

    (<any>component.users).changeUsername = () => {
      return { subscribe: fn => {
        fn({ alerts: [], data: [{}, '{}'] });
        called = true;
      } };
    };

    component.updateUsername();
    expect(called).toEqual(false);

    component.changeUsername = <any>{ newName: 'test' };
    component.updateUsername();

    expect(called).toEqual(true);
  });

  it('calls a service to update a user\'s email', () => {
    let called = false;

    (<any>component.users).changeEmail = () => {
      return { subscribe: fn => {
        fn({ alerts: [], data: [{}, '{}'] });
        called = true;
      } };
    };

    component.changeEmail = <any>{ newEmail: 'test' };
    component.updateEmail();
    expect(called).toEqual(false);

    component.changeEmail = <any>{ newEmail: 'test@test.net' };
    component.updateEmail();

    expect(called).toEqual(true);
  });

});

