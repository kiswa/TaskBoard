import { TestBed, getTestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { BoardService } from '../../../src/app/board/board.service';

describe('BoardService', () => {
  let injector: TestBed;
  let service: BoardService;
  let httpMock: HttpTestingController;

  const testCall = (url: string, method: string, isError = false) => {
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual(method);

    if (isError) {
      req.flush({ alerts: [{}] }, { status: 500, statusText: '' });
    } else {
      req.flush({ data: [] });
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BoardService]
    });

    injector = getTestBed();
    service = injector.get(BoardService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lets the active board get updated', () => {
    let changed = false;

    service.activeBoardChanged.subscribe(() => (changed = true));

    service.updateActiveBoard(<any>{});

    expect(changed).toEqual(true);
  });

  it('gets all boards', () => {
    service.getBoards().subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/boards', 'GET');
  });

  it('converts markdown', () => {
    const actual = service.convertMarkdown('# Test');

    expect(actual.html).toEqual('<h1 id="test">Test</h1>\n');
  });

  it('handles errors when getting all boards', () => {
    service.getBoards().subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/boards', 'GET', true);
  });

  it('toggles the collapsed state of a column', () => {
    service.toggleCollapsed(1, 1).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/users/1/cols', 'POST');
  });

  it('handles error when toggling collapse', () => {
    service.toggleCollapsed(1, 1).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/users/1/cols', 'POST', true);
  });

  it('updates a board', () => {
    service.updateBoard(<any>{ id: 1 }).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/boards/1', 'POST');
  });

  it('handles errors on board update', () => {
    service.updateBoard(<any>{ id: 1 }).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/boards/1', 'POST', true);
  });

  it('updates a column', () => {
    service.updateColumn(<any>{ id: 1 }).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/columns/1', 'POST');
  });

  it('handles errors on column update', () => {
    service.updateColumn(<any>{ id: 1 }).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/columns/1', 'POST', true);
  });

  it('adds a task', () => {
    service.addTask(<any>{}).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/tasks', 'POST');
  });

  it('handles errors on task add', () => {
    service.addTask(<any>{}).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/tasks', 'POST', true);
  });

  it('updates a task', () => {
    service.updateTask(<any>{ id: 1 }).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/tasks/1', 'POST');
  });

  it('handles errors on task update', () => {
    service.updateTask(<any>{ id: 1 }).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/tasks/1', 'POST', true);
  });

  it('removes a task', () => {
    service.removeTask(1).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/tasks/1', 'DELETE');
  });

  it('handles errors on task removal', () => {
    service.removeTask(1).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/tasks/1', 'DELETE', true);
  });

  it('gets task activity', () => {
    service.getTaskActivity(1).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/activity/task/1', 'GET');
  });

  it('handles errors on get task activity', () => {
    service.getTaskActivity(1).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/activity/task/1', 'GET', true);
  });

  it('updates a comment', () => {
    service.updateComment(<any>{ id: 1 }).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/comments/1', 'POST');
  });

  it('handles errors on comment update', () => {
    service.updateComment(<any>{ id: 1 }).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/comments/1', 'POST', true);
  });

  it('removes a comment', () => {
    service.removeComment(1).subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/comments/1', 'DELETE');
  });

  it('handles errors on comment removal', () => {
    service.removeComment(1).subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/comments/1', 'DELETE', true);
  });

  it('refreshes the API token', () => {
    service.refreshToken();
    testCall('api/refresh', 'POST');
  });

});

