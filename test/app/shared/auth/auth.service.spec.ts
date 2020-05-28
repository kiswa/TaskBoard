import { TestBed, getTestBed } from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Constants } from 'src/app/shared/constants';
import { StringsService } from 'src/app/shared/services';
import { AuthService } from 'src/app/shared/auth/auth.service';

describe('AuthService', () => {
  let injector: TestBed;
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        Constants,
        StringsService,
        AuthService
      ]
    });

    injector = getTestBed();
    service = injector.get(AuthService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('updates a user', () => {
    let actual = false;

    service.userChanged.subscribe(() => actual = true);
    service.updateUser(<any>{}, <any>{ id: 1 });

    expect(actual).toEqual(true);
    httpMock.expectOne('strings/en.json');
  });

  it('authenticates a user', () => {
    service.authenticate('').subscribe(response => {
      expect(response).toEqual(true);
    });

    testCall('api/authenticate', 'POST');

    service.authenticate('', true).subscribe(response => {
      expect(response).toEqual(true);
    });

    testCall('api/authenticate', 'POST');
  });

  it('handles errors on authenticate', () => {
    service.authenticate('').subscribe(response => {
      expect(response).toEqual(false);
    });

    testCall('api/authenticate', 'POST', true);
  });

  it('logs in a user', () => {
    service.login('test', 'test', true).subscribe(response => {
      expect(response.data.length).toEqual(2);
    });

    testCall('api/login', 'POST');
  });

  it('handles errors on user login', () => {
    service.login('test', 'test', true).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/login', 'POST', true);
  });

  it('logs out a user', () => {
    service.logout().subscribe(response => {
      expect(response.data.length).toEqual(2);
    });

    testCall('api/logout', 'POST');
  });

  const testCall = (url: string, method: string, isError = false) => {
    const req = httpMock.expectOne({ method, url });
    expect(req.request.method).toEqual(method);

    if (isError) {
      req.flush({ alerts: [{}] }, { status: 500, statusText: '' });
    } else {
      req.flush({ data: [{}, {}] });
    }
  };

});

