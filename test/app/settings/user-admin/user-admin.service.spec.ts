import { TestBed, getTestBed } from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  UserAdminService
} from '../../../../src/app/settings/user-admin/user-admin.service';

describe('UserAdminService', () => {
  let injector: TestBed;
  let service: UserAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserAdminService]
    });

    injector = getTestBed();
    service = injector.get(UserAdminService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds a user', () => {
    service.addUser(<any>{}).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/users', 'POST');
  });

  it('handles errors on add user', () => {
    service.addUser(<any>{}).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/users', 'POST', true);
  });

  it('edits a user', () => {
    service.editUser(<any>{ id: 1 }).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/users/1', 'POST');
  });

  it('handles errors on edit user', () => {
    service.editUser(<any>{ id: 1 }).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/users/1', 'POST', true);
  });

  it('removes a user', () => {
    service.removeUser(1).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/users/1', 'DELETE');
  });

  it('handles errors on remove user', () => {
    service.removeUser(1).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/users/1', 'DELETE', true);
  });

  const testCall = (url, method, isError = false) => {
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual(method);

    if (isError) {
      req.flush({ alerts: [{}] }, { status: 500, statusText: '' });
    } else {
      req.flush({ data: [] });
    }
  };

});

