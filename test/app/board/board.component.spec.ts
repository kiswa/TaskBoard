import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { DragulaService } from 'ng2-dragula/dist';
import { DragulaModule } from 'ng2-dragula/dist';

import {
  AuthService,
  StringsService,
  Constants,
  ContextMenuService,
  NotificationsService
} from '../../../src/app/shared/services';
import { LoginComponent } from '../../../src/app/login/login.component';
import { SettingsModule } from '../../../src/app/settings/settings.module';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { DashboardModule } from '../../../src/app/dashboard/dashboard.module';
import { BoardDisplayComponent } from '../../../src/app/board/board.component';
import { BoardService } from '../../../src/app/board/board.service';
import { ColumnDisplayComponent } from '../../../src/app/board/column/column.component';
import { TaskDisplayComponent } from '../../../src/app/board/task/task.component';
import { RouterMock, BoardServiceMock, DragulaMock } from '../mocks';

describe('BoardDisplay', () => {
  let component: BoardDisplayComponent;
  let fixture: ComponentFixture<BoardDisplayComponent>;

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
        LoginComponent,
        BoardDisplayComponent,
        ColumnDisplayComponent,
        TaskDisplayComponent
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
    fixture = TestBed.createComponent(BoardDisplayComponent);
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

    component.activeUser = { default_board_id: 2 } as any;
    component.ngOnInit();

    const location = TestBed.get(Location);
    expect(component.boardNavId).toEqual(2);
    expect(location.path()).toEqual('/boards/2');
  });

  it('sets up drag and drop during ngAfterContentInit', () => {
    component.activeBoard = { columns: [
      { id: 1, tasks: [{}] }
    ] } as any;
    component.ngAfterContentInit();

    expect((component.dragula as any).opts.moves).toEqual(jasmine.any(Function));

    const test = (component.dragula as any).opts.moves(null, null, {
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
    component.activeBoard = { columns: [
      { tasks: [{ hidefiltered: true }] }
    ] } as any;

    component.toggleFiltered();
    expect(component.activeBoard.columns[0].tasks[0].hideFiltered).toEqual(false);
  });

  it('has a function to filter tasks', () => {
    component.userFilter = -1;

    component.activeBoard = {
      columns: [{
        tasks: [{
          assignees: []
        }]
      }]
    } as any;

    const task = component.activeBoard.columns[0].tasks[0];

    component.filterTasks();
    expect(task.filtered).toEqual(false);

    task.assignees = [{ id: 1 }] as any;

    component.filterTasks();
    expect(task.filtered).toEqual(true);

    component.userFilter = 1;
    component.filterTasks();
    expect(task.filtered).toEqual(false);

    component.categoryFilter = -1;
    task.categories = [];

    component.filterTasks();
    expect(task.filtered).toEqual(false);

    task.categories = [{ id: 1 }] as any;

    component.filterTasks();
    expect(task.filtered).toEqual(true);

    component.categoryFilter = 1;
    component.filterTasks();
    expect(task.filtered).toEqual(false);
  });

  it('updates the active board from a service', () => {
    component.boardService.updateActiveBoard(null);
    component.boardService.updateActiveBoard({} as any);

    expect(component.activeBoard).toEqual(jasmine.any(Object));
  });

  it('updates the active user from a service', () => {
    component.auth.updateUser({ security_level: 1 } as any);

    expect(component.activeUser).toEqual(jasmine.any(Object));
  });

});
