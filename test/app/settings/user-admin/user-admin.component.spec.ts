import { TestBed, ComponentFixture } from '@angular/core/testing';
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
  UserDisplay
} from '../../../../src/app/settings/user-admin/user-admin.models';
import {
  UserAdminComponent
} from '../../../../src/app/settings/user-admin/user-admin.component';

describe('UserAdmin', () => {
  let component: UserAdminComponent;
  let fixture: ComponentFixture<UserAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule
      ],
      declarations: [
        UserAdminComponent
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
    fixture = TestBed.createComponent(UserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('calls a service to add a user', () => {
    let called = false;

    (component.modal as any).isOpen = () => true;
    (component.userService as any).addUser = () => {
      return { subscribe: (fn: any) => {
        const user = new User();
        fn({ status: 'success', alerts: [{}], data: [{}, [user]] });
        called = true;
      } };
    };

    component.modalProps = {
      prefix: true,
      user: {
        username: 'test',
        password: 'pass',
        password_verify: 'pass',
        email: 'you@me.net'
      } as any
    } as any;

    component.addEditUser();
    expect(called).toEqual(true);
  });

  it('calls a service to edit a user', () => {
    let called = false;

    (component.modal as any).isOpen = () => true;
    (component.userService as any).editUser = () => {
      return { subscribe: (fn: any) => {
        const user = new User();
        user.board_access = [1];

        fn({ status: 'success',
          alerts: [{}],
          data: [{}, JSON.stringify([user])] });
        called = true;
      } };
    };

    component.modalProps = {
      prefix: false,
      user: {
        username: 'test',
        password: 'pass',
        password_verify: 'pass',
        email: 'you@me.net'
      } as any
    } as any;

    component.addEditUser();
    expect(called).toEqual(true);
  });

  it('calls a service to remove a user', () => {
    let called = false;

    (component.userService as any).removeUser = () => {
      return { subscribe: (fn: any) => {
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

    (component.userService as any).addUser = () => {
      return { subscribe: fn => {
        const user = new User();
        fn({ status: 'success', alerts: [{}], data: [{}, [user]] });
        called = true;
      } };
    };
    (component.modal as any).isOpen = () => true;

    component.modalProps = {
      prefix: true,
      user: {
        username: ''
      }
    } as any;

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

