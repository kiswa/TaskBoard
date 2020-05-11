import { TestBed, getTestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

import { FileViewerService } from 'src/app/files/file-viewer.service';

describe('FileViewerService', () => {
  let injector: TestBed;
  let service: FileViewerService;
  let httpMock: HttpTestingController;

  const testCall = (url: string, method: string, isError = false) => {
    const req = httpMock.expectOne(url);
    expect(req.request.method).toEqual(method);

    if (isError) {
      req.flush({ alerts: [{}], data: [] }, { status: 500, statusText: '' });
    } else {
      req.flush({ data: [] });
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FileViewerService]
    });

    injector = getTestBed();
    service = injector.get(FileViewerService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify()
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets attachment info', () => {
    service.getAttachmentInfo('asdf').subscribe(response => {
      expect(response.data.length).toEqual(0);
    });

    testCall('api/attachments/hash/asdf', 'GET');
  });

  it('handles errors when getting all boards', () => {
    service.getAttachmentInfo('asdf').subscribe(() => {}, response => {
      expect(response.alerts.length).toEqual(1);
    });

    testCall('api/attachments/hash/asdf', 'GET', true);
  });

});

