import { TestBed, getTestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  AutoActionsService
} from 'src/app/settings/auto-actions/auto-actions.service';

describe('AutoActionsService', () => {
  let injector: TestBed;
  let service: AutoActionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AutoActionsService]
    });

    injector = getTestBed();
    service = injector.get(AutoActionsService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds an action', () => {
    service.addAction({} as any).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/autoactions', 'POST');
  });

  it('handles errors when adding an action', () => {
    service.addAction({} as any).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/autoactions', 'POST', true);
  });

  it('removes an action', () => {
    service.removeAction({ id: 1 } as any).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/autoactions/1', 'DELETE');
  });

  it('handles errors when removing an action', () => {
    service.removeAction({ id: 1 } as any).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/autoactions/1', 'DELETE', true);
  });

  const testCall = (url: string, method: string, isError = false) => {
    const req = httpMock.expectOne('http://localhost:9876' + url);
    expect(req.request.method).toEqual(method);

    if (isError) {
      req.flush({ alerts: [{}] }, { status: 500, statusText: '' });
    } else {
      req.flush({ data: [] });
    }
  };

});

