import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { ColumnDisplay } from '../../../../src/app/board/column/column.component';
import { TaskDisplay } from '../../../../src/app/board/task/task.component';
import {
  AuthService,
  StringsService,
  Constants,
  ContextMenuService,
  ModalService,
  NotificationsService
} from '../../../../src/app/shared/services';
import { BoardService } from '../../../../src/app/board/board.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';

describe('ColumnDisplay', () => {
  let component: ColumnDisplay,
    fixture: ComponentFixture<ColumnDisplay>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
        DragulaModule,
        SharedModule
      ],
      declarations: [
        ColumnDisplay,
        TaskDisplay
      ],
      providers: [
        DragulaService,
        AuthService,
        NotificationsService,
        ModalService,
        StringsService,
        BoardService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements OnInit', () => {
    component.userOptions = <any>{ multiple_tasks_per_row: true };
    component.columnData = <any>{ id: 1, task_limit: 3, tasks: [] };
    component.activeUser = <any>{ collapsed: [1] };

    component.ngOnInit();

    expect(component.templateElement.classList.contains('collapsed')).toEqual(true);
  });

  it('sorts tasks', () => {
    component.columnData = <any>{ tasks:[
      { position: 2, due_date: '1/1/2018', points: 1 },
      { position: 1, due_date: '1/1/2019', points: 3 }
    ] };

    component.sortOption = 'pos';
    component.sortTasks();
    expect(component.columnData.tasks[0].position).toEqual(1);

    component.sortOption = 'due';
    component.sortTasks();
    expect(component.columnData.tasks[0].due_date).toEqual('1/1/2018');

    component.sortOption = 'pnt';
    component.sortTasks();
    expect(component.columnData.tasks[0].points).toEqual(3);
  });

  it('calls a service to toggle collapsed state', () => {
    (<any>component.boardService.toggleCollapsed) = () => {
      return { subscribe: fn =>  fn(<any>{ data: [{}, [1]] }) };
    };
    component.activeUser = <any>{ id: 1, collapsed: [] };
    component.columnData = <any>{ id: 1 };

    component.toggleCollapsed();

    expect(component.templateElement.classList
      .contains('collapsed')).toEqual(true);
    expect(component.activeUser.collapsed[0]).toEqual(1);
  });

  it('toggles task collapsing', () => {
    component.collapseTasks = false;

    component.toggleTaskCollapse();
    expect(component.collapseTasks).toEqual(true);
  });

  it('updates task color by category', () => {
    const mock = [<any>{ default_task_color: 'red' }];
    component.updateTaskColorByCategory(mock);

    expect(component.modalProps.categories).toEqual(mock);
    expect(component.modalProps.color).toEqual('red');
  });

  it('calls a service to add a task', () => {
    component.addTask();
    expect(component.saving).toEqual(false);

    (<any>component.boardService.addTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'error', alerts: [{}] }) };
    };

    component.modalProps = <any>{ title: 'Testing' };
    component.addTask();
    expect(component.saving).toEqual(false);

    (<any>component.boardService.addTask) = () => {
      return { subscribe: fn =>  fn(<any>{
        status: 'success',
        alerts: [],
        data: [{}, {}, [{ ownColumn: [{}] }]]
      }) };
    };

    component.addTask();
    expect(component.saving).toEqual(false);
    });

  it('calls a service to update a task', () => {
    component.updateTask();
    expect(component.saving).toEqual(false);

    (<any>component.boardService.updateTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'error', alerts: [{}] }) };
    };

    component.modalProps = <any>{ title: 'Testing' };
    component.updateTask();
    expect(component.saving).toEqual(false);

    (<any>component.boardService.updateTask) = () => {
      return { subscribe: fn =>  fn(<any>{
        status: 'success',
        alerts: [],
        data: [{}, {}, [{ ownColumn: [{}] }]]
      }) };
    };

    component.updateTask();
    expect(component.saving).toEqual(false);
    });

  it('calls a service to remove a task', () => {
    let called = false;
    component.taskToRemove = 1;

    (<any>component.boardService.removeTask) = () => {
      return { subscribe: fn => {
        called = true;
        fn(<any>{ status: 'error', alerts: [{}] });
      } };
    };

    component.removeTask();
    expect(called).toEqual(true);

    (<any>component.boardService.removeTask) = () => {
      return { subscribe: fn => {
        called = true;
        fn(<any>{
          status: 'success',
          alerts: [{}],
          data: [{}, [{}]]
        });
      } };
    };

    component.removeTask();
    expect(called).toEqual(true);
  });

});

