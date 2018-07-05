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
  UserAdminService
} from '../../../../src/app/settings/user-admin/user-admin.service';
import { User } from '../../../../src/app/shared/models';
import { SettingsServiceMock, AuthServiceMock } from '../../mocks';

import {
  UserDisplay, ModalUser
} from '../../../../src/app/settings/user-admin/user-admin.models';
import {
  UserAdmin
} from '../../../../src/app/settings/user-admin/user-admin.component';

describe('UserAdmin', () => {
  let component: UserAdmin,
    fixture: ComponentFixture<UserAdmin>;

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
        UserAdmin
      ],
      providers: [
        ModalService,
        NotificationsService,
        StringsService,
        UserAdminService,
        { provide: SettingsService, useClass: SettingsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('calls a service to add a user', () => {
    let called = false;

    (<any>component.modal).isOpen = () => true;
    (<any>component.userService).addUser = () => {
      return { subscribe: fn => {
        const user = new User();
        fn({ status: 'success', alerts: [{}], data: [{}, [user]] });
        called = true;
      } };
    };

    component.modalProps = <any>{
      prefix: true,
      user: <any>{
        username: 'test',
        password: 'pass',
        password_verify: 'pass',
        email: 'you@me.net'
      }
    };

    component.addEditUser();
    expect(called).toEqual(true);
  });

  it('calls a service to edit a user', () => {
    let called = false;

    (<any>component.modal).isOpen = () => true;
    (<any>component.userService).editUser = () => {
      return { subscribe: fn => {
        const user = new User();
        user.board_access = [1];
        const mUser = new ModalUser(user);

        fn({ status: 'success',
          alerts: [{}],
          data: [{}, JSON.stringify([user])] });
        called = true;
      } };
    };

    component.modalProps = <any>{
      prefix: false,
      user: <any>{
        username: 'test',
        password: 'pass',
        password_verify: 'pass',
        email: 'you@me.net'
      }
    };

    component.addEditUser();
    expect(called).toEqual(true);
  });

  it('calls a service to remove a user', () => {
    let called = false;

    (<any>component.userService).removeUser = () => {
      return { subscribe: fn => {
        fn({ status: 'success', alerts: [{}], data: [{}, []] });
        called = true;
      } };
    };

    component.userToRemove = new UserDisplay();
    component.removeUser();
    expect(called).toEqual(true);
  });

  it('validates modal user data', () => {
    let called = false;

    (<any>component.userService).addUser = () => {
      return { subscribe: fn => {
        const user = new User();
        fn({ status: 'success', alerts: [{}], data: [{}, [user]] });
        called = true;
      } };
    };
    (<any>component.modal).isOpen = () => true;

    component.modalProps = <any>{
      prefix: true,
      user: {
        username: ''
      }
    };

    component.addEditUser();
    expect(called).toEqual(false);

    component.modalProps.user.username = 'test';
    component.modalProps.user.password = '';

    component.addEditUser();
    expect(called).toEqual(false);

    component.modalProps.prefix = false;
    component.modalProps.user.password = 'test';
    component.modalProps.user.password_verify = '';

    component.addEditUser();
    expect(called).toEqual(false);

    component.modalProps.user.password_verify = 'test';
    component.modalProps.user.email = 'notvalid';

    component.addEditUser();
    expect(called).toEqual(false);
  });

});

