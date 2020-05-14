import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { SettingsService } from 'src/app/settings/settings.service';
import { User } from 'src/app/shared/models';
import { UserDisplay } from 'src/app/settings/user-admin/user-admin.models';

import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from 'src/app/shared/services';
import {
  UserAdminService
} from 'src/app/settings/user-admin/user-admin.service';
import {
  UserAdminComponent
} from 'src/app/settings/user-admin/user-admin.component';

import { SettingsServiceMock, AuthServiceMock } from '../../mocks';

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

  it('shows a modal', () => {
    component.showModal();
    expect(component.modalProps.prefix).toEqual(true);

    const user = new UserDisplay(1);
    user.board_access = [1, 2];

    component.showModal(false, user);
    expect(component.modalProps.prefix).toEqual(false);
  });

  it('shows a confirmation modal', () => {
    const user = new UserDisplay(1);

    component.showConfirmModal(user);

    expect(component.userToRemove).toEqual(user);
  });

  it('validates modal user data', () => {
    let called = false;

    (component.userService as any).addUser = () => {
      return { subscribe: (fn: any) => {
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

