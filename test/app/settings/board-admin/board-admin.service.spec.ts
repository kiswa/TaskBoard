import { TestBed, getTestBed } from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  BoardAdminService
} from '../../../../src/app/settings/board-admin/board-admin.service';

describe('BoardAdminService', () => {
  let injector: TestBed;
  let service: BoardAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BoardAdminService]
    });

    injector = getTestBed();
    service = injector.get(BoardAdminService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds a board', () => {
    service.addBoard(<any>{}).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/boards', 'POST');
  });

  it('handles errors on add board', () => {
    service.addBoard(<any>{}).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/boards', 'POST', true);
  });

  it('edits a board', () => {
    service.editBoard(<any>{ id: 1 }).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/boards/1', 'POST');
  });

  it('handles errors on edit board', () => {
    service.editBoard(<any>{id: 1}).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/boards/1', 'POST', true);
  });

  it('removes a board', () => {
    service.removeBoard(1).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/boards/1', 'DELETE');
  });

  it('handles errors on edit board', () => {
    service.removeBoard(1).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/boards/1', 'DELETE', true);
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

