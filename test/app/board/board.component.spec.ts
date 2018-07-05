import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
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
import { RouterMock, BoardServiceMock, DragulaMock } from '../mocks';

describe('BoardDisplay', () => {
  let component: BoardDisplay,
    fixture: ComponentFixture<BoardDisplay>;

  beforeEach(() => {
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
        StringsService,
        ContextMenuService,
        NotificationsService,
        { provide: BoardService, useClass: BoardServiceMock },
        { provide: DragulaService, useClass: DragulaMock },
        { provide: Router, useClass: RouterMock },
        {
          provide: ActivatedRoute,
          useValue: {
            url: new BehaviorSubject([{ path: 'boards/1' }]),
            params: new BehaviorSubject({ id: 1 })
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets the title when constructed', () => {
    expect(component.title.getTitle()).toEqual('TaskBoard - Test');
  });

  it('implements ngOnOnit', () => {
    component.boardNavId = 0;
    component.ngOnInit();
    expect(component.boardNavId).toEqual(0);

    component.activeUser = <any>{ default_board_id: 2 };
    component.ngOnInit();

    const location = TestBed.get(Location);
    expect(component.boardNavId).toEqual(2);
    expect(location.path()).toEqual('/boards/2');
  });

  it('sets up drag and drop during ngAfterContentInit', () => {
    component.activeBoard = <any>{ columns: [
      { id: 1, tasks: [{}] }
    ] };
    component.ngAfterContentInit();

    expect((<any>component.dragula).opts.moves).toEqual(jasmine.any(Function));

    const test = (<any>component.dragula).opts.moves(null, null, {
      classList: { contains: () => false }
    });
    expect(test).toEqual(false);
  });

  it('has a function to open a board', () => {
    component.boardNavId = null;
    component.goToBoard();

    component.boardNavId = 1;
    component.goToBoard();

    const location = TestBed.get(Location);
    expect(location.path()).toEqual('/boards/1');
  });

  it('has a function to toggle filtered tasks', () => {
    component.activeBoard = <any>{ columns: [
      { tasks: [{ hidefiltered: true }] }
    ] };

    component.toggleFiltered();
    expect(component.activeBoard.columns[0].tasks[0].hideFiltered).toEqual(false);
  });

  it('has a function to filter tasks', () => {
    component.userFilter = -1;

    component.activeBoard = <any>{
      columns: [{
        tasks: [{
          assignees: []
        }]
      }]
    };

    const task = component.activeBoard.columns[0].tasks[0];

    component.filterTasks();
    expect(task.filtered).toEqual(false);

    task.assignees = <any>[{ id: 1 }];

    component.filterTasks();
    expect(task.filtered).toEqual(true);

    component.userFilter = 1;
    component.filterTasks();
    expect(task.filtered).toEqual(false);

    component.categoryFilter = -1;
    task.categories = [];

    component.filterTasks();
    expect(task.filtered).toEqual(false);

    task.categories = <any>[{ id: 1 }];

    component.filterTasks();
    expect(task.filtered).toEqual(true);

    component.categoryFilter = 1;
    component.filterTasks();
    expect(task.filtered).toEqual(false);
  });

  it('has a function to check for boards', () => {
    expect(component.noBoards).toEqual(jasmine.any(Function));

    component.loading = true;
    expect(component.noBoards()).toEqual(false);

    component.loading = false;
    component.boards = [];

    expect(component.noBoards()).toEqual(true);

    component.boards = <any>[{}];
    expect(component.noBoards()).toEqual(false);
  });

  it('updates the active board from a service', () => {
    component.boardService.updateActiveBoard(null);
    component.boardService.updateActiveBoard(<any>{});

    expect(component.activeBoard).toEqual(jasmine.any(Object));
  });

  it('updates the active user from a service', () => {
    component.auth.updateUser(<any>{ security_level: 1 });

    expect(component.activeUser).toEqual(jasmine.any(Object));
  });

});

