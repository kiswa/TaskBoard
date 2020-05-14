import { TestBed, getTestBed } from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { SettingsService } from 'src/app/settings/settings.service';

describe('SettingsService', () => {
  let injector: TestBed;
  let service: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SettingsService]
    });

    injector = getTestBed();
    service = injector.get(SettingsService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('notifies subscribers when users change', () => {
    let called = false;

    service.usersChanged.subscribe(() => {
      called = true;
    });

    service.updateUsers(<any>[]);

    expect(called).toEqual(true);
  });

  it('gets all users', () => {
    service.getUsers().subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/users', 'GET');
  });

  it('handles errors on get users', () => {
    service.getUsers().subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/users', 'GET', true);
  });

  it('loads actions and notifies subscribers when boards change', () => {
    let called = false;

    service.boardsChanged.subscribe(() => {
      called = true;
    });

    service.updateBoards(<any>[]);

    expect(called).toEqual(true);
    testCall('api/autoactions', 'GET');
  });

  it('gets all boards', () => {
    service.getBoards().subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/boards', 'GET');
  });

  it('handles errors on get boards', () => {
    service.getBoards().subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/boards', 'GET', true);
  });

  it('notifies subscribers when actions change', () => {
    let called = false;

    service.actionsChanged.subscribe(() => {
      called = true;
    });

    service.updateActions(<any>[]);

    expect(called).toEqual(true);
  });

  it('gets all actions', () => {
    service.getActions().subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/autoactions', 'GET');
  });

  it('handles errors on get users', () => {
    service.getActions().subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/autoactions', 'GET', true);
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

