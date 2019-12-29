import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from '../../../src/app/login/login.component';
import { SharedModule } from '../../../src/app/shared/shared.module';
import {
  Constants,
  AuthService,
  NotificationsService
} from '../../../src/app/shared/services';

describe('Login', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        SharedModule
      ],
      declarations: [
        LoginComponent
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
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements OnInit', () => {
    (component.authService as any).authenticate = () => {
      return { subscribe: (fn: any) => { fn(true); } };
    };

    const spy = spyOn((component as any).router, 'navigate');

    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(['/boards']);
  });

  it('requires a username and password to log in', () => {
    let called = false;

    (component as any).notes = { add: () => { called = true; } };

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

    (component.authService as any).login = () => {
      return { subscribe: (fn: any) => fn({ status: 'success', alerts: [{}] }) };
    };

    const spy = spyOn((component as any).router, 'navigate');
    component.login();

    expect(spy).toHaveBeenCalledWith(['/boards']);
  });
});

