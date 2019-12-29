import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import {
  AuthService,
  NotificationsService,
  StringsService
} from '../../../../src/app/shared/services';
import { SettingsService } from '../../../../src/app/settings/settings.service';
import {
  UserSettingsService
} from '../../../../src/app/settings/user-settings/user-settings.service';
import { SettingsServiceMock, AuthServiceMock } from '../../mocks';

import {
  UserSettingsComponent
} from '../../../../src/app/settings/user-settings/user-settings.component';

describe('UserSettings', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule
      ],
      declarations: [
        UserSettingsComponent
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
    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('updates user options and calls a service', () => {
    let called = false;

    (component.users as any).changeUserOptions = () => {
      return { subscribe: (fn: any) => {
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

    (component.users as any).changeDefaultBoard = () => {
      return { subscribe: (fn: any) => {
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

    (component.users as any).changePassword = () => {
      return { subscribe: (fn: any) => {
        fn({ alerts: [], data: [{}, '{}'] });
        called = true;
      } };
    };

    component.updatePassword();
    expect(called).toEqual(false);

    component.changePassword = { current: 'test', newPass: 'tester', verPass: 'test' } as any;
    component.updatePassword();
    expect(called).toEqual(false);

    component.changePassword = { current: 'test', newPass: 'tester', verPass: 'tester' } as any;
    component.updatePassword();

    expect(called).toEqual(true);
  });

  it('calls a service to update a user\'s username', () => {
    let called = false;

    (component.users as any).changeUsername = () => {
      return { subscribe: (fn: any) => {
        fn({ alerts: [], data: [{}, '{}'] });
        called = true;
      } };
    };

    component.updateUsername();
    expect(called).toEqual(false);

    component.changeUsername = { newName: 'test' } as any;
    component.updateUsername();

    expect(called).toEqual(true);
  });

  it('calls a service to update a user\'s email', () => {
    let called = false;

    (component.users as any).changeEmail = () => {
      return { subscribe: (fn: any) => {
        fn({ alerts: [], data: [{}, '{}'] });
        called = true;
      } };
    };

    component.changeEmail = { newEmail: 'test' } as any;
    component.updateEmail();
    expect(called).toEqual(false);

    component.changeEmail = { newEmail: 'test@test.net' } as any;
    component.updateEmail();

    expect(called).toEqual(true);
  });

});

