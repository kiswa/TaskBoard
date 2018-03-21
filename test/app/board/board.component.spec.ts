import { async, TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import {
  AuthService,
  StringsService,
  Constants,
  ContextMenuService,
  NotificationsService
} from '../../../src/app/shared/services';
import { Login } from '../../../src/app/login/login.component';
import { SettingsModule } from '../../../src/app/settings/settings.module';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { DashboardModule } from '../../../src/app/dashboard/dashboard.module';
import { BoardDisplay } from '../../../src/app/board/board.component';
import { BoardService } from '../../../src/app/board/board.service';
import { ColumnDisplay } from '../../../src/app/board/column/column.component';
import { TaskDisplay } from '../../../src/app/board/task/task.component';

describe('BoardDisplay', () => {
  let component: BoardDisplay,
    fixture: ComponentFixture<BoardDisplay>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        DragulaModule,
        SettingsModule,
        SharedModule,
        DashboardModule
      ],
      declarations: [
        Login,
        BoardDisplay,
        ColumnDisplay,
        TaskDisplay
      ],
      providers: [
        Title,
        Constants,
        AuthService,
        BoardService,
        StringsService,
        ContextMenuService,
        NotificationsService,
        {
          provide: ActivatedRoute,
          useValue: {
            url: new BehaviorSubject([{ path: 'boards/1' }]),
            params: new BehaviorSubject({ id: 1 })
          }
        }
      ]
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

