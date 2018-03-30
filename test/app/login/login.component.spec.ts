import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { Login } from '../../../src/app/login/login.component';
import { SharedModule } from '../../../src/app/shared/shared.module'
import {
  Constants,
  AuthService,
  NotificationsService
} from '../../../src/app/shared/services';

describe('Login', () => {
  let component: Login,
    fixture: ComponentFixture<Login>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        SharedModule
      ],
      declarations: [
        Login
      ],
      providers: [
        RouterTestingModule,
        Constants,
        AuthService,
        NotificationsService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements OnInit', () => {
    (<any>component.authService).authenticate = () => {
      return { subscribe: fn => { fn(true); } };
    };

    let spy = spyOn((<any>component).router, 'navigate');

    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(['/boards']);
  });

  it('requires a username and password to log in', () => {
    let called = false;

    (<any>component).notes = { add: () => { called = true; } };

    component.login();
    expect(called).toEqual(true);

    component.username = 'name';
    called = false;

    component.login();
    expect(called).toEqual(true);
  });

  it('calls a service to log in', () => {
    component.username = 'name';
    component.password = 'pass';

    (<any>component.authService).login = () => {
      return { subscribe: fn => fn({ status: 'success', alerts:[{}] }) };
    };

    let spy = spyOn((<any>component).router, 'navigate');
    component.login();

    expect(spy).toHaveBeenCalledWith(['/boards']);
  });
});

