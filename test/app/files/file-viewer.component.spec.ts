import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FileViewerComponent } from 'src/app/files/file-viewer.component';
import { FileViewerService } from 'src/app/files/file-viewer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationsService, AuthService } from 'src/app/shared/services';
import { SharedModule } from 'src/app/shared/shared.module';

describe('FileViewer', () => {
  let component: FileViewerComponent;
  let fixture: ComponentFixture<FileViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule,
      ],
      declarations: [
        FileViewerComponent,
      ],
      providers: [
        AuthService,
        FileViewerService,
        NotificationsService,
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileViewerComponent);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements ngOnInit', () => {
    (component.service.getAttachmentInfo as any) = () => {
      return { subscribe: (fn: any) => fn({
        alerts: [{}],
        data: [{}, { diskfilename: 'asdf' }],
        status: 'success'
      }) }
    }

    component.ngOnInit();

    expect(component.isLoaded).toEqual(true);
    expect(component.fileUrl).toBeTruthy();
  });
});

