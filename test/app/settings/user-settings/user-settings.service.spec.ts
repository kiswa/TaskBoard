import { TestBed, getTestBed } from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { AuthService } from '../../../../src/app/shared/services';
import { AuthServiceMock } from '../../mocks';

import {
  UserSettingsService
} from '../../../../src/app/settings/user-settings/user-settings.service';

describe('UserSettingsService', () => {
  let injector: TestBed;
  let service: UserSettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserSettingsService,
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    });

    injector = getTestBed();
    service = injector.get(UserSettingsService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('changes default board', () => {
    service.changeDefaultBoard(<any>{}).subscribe(response => {
      expect(response.data.length).toEqual(2);
    });

    testCall('api/users/1', 'POST');
  });

  it('handles errors on change default board', () => {
    service.changeDefaultBoard(<any>{}).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/users/1', 'POST', true);
  });

  it('changes password', () => {
    service.changePassword('', '').subscribe(response => {
      expect(response.data.length).toEqual(2);
    });

    testCall('api/users/1', 'POST');
  });

  it('handles errors on change password', () => {
    service.changePassword('', '').subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/users/1', 'POST', true);
  });

  // it('changes username', () => {
  //   service.changeUsername('').subscribe(response => {
  //     expect(response.data.length).toEqual(2);
  //   });
  //
  //   testCall('api/users/1', 'POST');
  // });
  //
  // it('handles errors on change username', () => {
  //   service.changeUsername('').subscribe(() => {}, response => {
  //     expect(response.alerts.length).toEqual(1);
  //   });
  //
  //   testCall('api/users/1', 'POST', true);
  // });

  // it('changes email', () => {
  //   service.changeEmail('').subscribe(response => {
  //     expect(response.data.length).toEqual(2);
  //   });
  //
  //   testCall('api/users/1', 'POST');
  // });
  //
  // it('handles errors on change email', () => {
  //   service.changeEmail('').subscribe(() => {}, response => {
  //     expect(response.alerts.length).toEqual(1);
  //   });
  //
  //   testCall('api/users/1', 'POST', true);
  // });

  const testCall = (url, method, isError = false) => {
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual(method);

    if (isError) {
      req.flush({ alerts: [{}], data: [] }, { status: 500, statusText: '' });
    } else {
      req.flush({ data: [{}, {}] });
    }
  }

});

