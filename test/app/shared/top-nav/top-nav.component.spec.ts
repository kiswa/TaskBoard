import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { TopNav } from '../../../../src/app/shared/top-nav/top-nav.component';
import {
  Constants,
  AuthService,
  NotificationsService,
  StringsService
} from '../../../../src/app/shared/services';

describe('TopNav', () => {
  let component: TopNav,
    fixture: ComponentFixture<TopNav>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        FormsModule
      ],
      declarations: [ TopNav ],
      providers: [
        RouterTestingModule,
        Constants,
        AuthService,
        NotificationsService,
        StringsService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNav);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('can log out a user', () => {
    let called = false;

    (<any>component.authService).logout = () => {
      return { subscribe: fn => {
        fn({ alerts: [{}] });
        called = true;
      } };
    };

    component.logout();
    expect(called).toEqual(true);
  });

  it('checks if a route is active', () => {
    const actual = component.isActive('nope');

    expect(actual).toEqual(false);
  });

  it('can navigate to a target route', () => {
    let spy = spyOn((<any>component).router, 'navigate');

    component.navigateTo('test');
    expect(spy).toHaveBeenCalledWith(['/test']);
  });

});

