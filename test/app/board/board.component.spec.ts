import { async, TestBed, ComponentFixture } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { BaseRequestOptions, Http } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import {
  AuthService,
  StringsService,
  Constants,
  ContextMenuService,
  NotificationsService
} from '../../../src/app/shared/index';
import { Login } from '../../../src/app/login/login.component';
import { Settings } from '../../../src/app/settings/index';
import { Dashboard } from '../../../src/app/dashboard/index';
import { BoardService, BoardDisplay } from '../../../src/app/board/index';
import { ROUTES } from '../../../src/app/app.routes';

describe('BoardDisplay', () => {
  let component: BoardDisplay,
    fixture: ComponentFixture<BoardDisplay>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(ROUTES),
        FormsModule,
        DragulaModule
      ],
      declarations: [
        BoardDisplay,
        Login,
        Settings,
        Dashboard
      ],
      providers: [
        Title,
        Constants,
        AuthService,
        BoardService,
        StringsService,
        ContextMenuService,
        NotificationsService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: ActivatedRoute,
          useValue: {
            url: new BehaviorSubject([{ path: 'boards/1' }]),
            params: new BehaviorSubject({ id: 1 })
          }
        },
        {
          provide: Http,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [ MockBackend, BaseRequestOptions ]
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('sets the title when constructed', () => {
    expect(component.title.getTitle()).toEqual('TaskBoard - Kanban App');
  })
});

