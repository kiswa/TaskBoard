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
import { User } from '../../../../src/app/shared/models';

describe('ColumnDisplay', () => {
  let component: ColumnDisplay,
    fixture: ComponentFixture<ColumnDisplay>;

  const mockTask = {
    id: 1, title: 'test', description: '', color: '#ffffe0', due: Date.now,
    points: 3, position: 1, column_id: 1,
    ownComment: [{
      id: 1, text: '', user_id: 1, task_id: 1, timestamp: Date.now()
    }],
    ownAttachment: [],
    sharedUser: [],
    sharedCategory: []
  };

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

  it('calls a service to add a comment', () => {
    component.viewModalProps.id = 0;
    component.addComment();

    component.activeUser = new User();
    component.viewModalProps.id = 1;
    component.newComment = 'Testing.';
    component.addComment();

    expect(component.newComment).toEqual('');

    (<any>component.boardService.updateTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'error' }) };
    };

    component.addComment();
    expect(component.newComment).toEqual('');

    (<any>component.boardService.updateTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'success', data:[{}, [
        mockTask, { id: 2 }
      ]] }) };
    };

    component.activeBoard = <any>{
      columns: [{ id: 1, tasks: [{ id: 1 }, { id: 2 }] }, { id: 2 }]
    };

    component.addComment();
    expect(component.viewModalProps.id).toEqual(1);
  });

  it('loads a comment into the editor', () => {
    component.beginEditComment(<any>{ id: 1, text: 'Testing' });
    expect(component.commentEdit.text).toEqual('Testing');
  });

  it('calls a service to edit a comment', () => {
    component.activeUser = <any>{ id: 1 };
    component.commentEdit = <any>{ is_edited: false, user_id: 0 };

    (<any>component.boardService.updateComment) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'error', alerts: [{}] }) };
    };

    component.editComment();
    expect(component.commentEdit.is_edited).toEqual(true);

    component.activeBoard = <any>{
      columns: [{ id: 1, tasks: [{ id: 1 }, { id: 2 }] }, { id: 2 }]
    };

    (<any>component.boardService.updateComment) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'success', alerts: [{}],
        data: [{}, [mockTask]]
      }) };
    };

    component.editComment();
    expect(component.viewModalProps.id).toEqual(1);
  });

  it('calls aservice to remove a comment', () => {
    component.viewModalProps = <any>{ comments: [{ id: 1 }] };
    component.commentToRemove = <any>{ id: 1 };

    component.activeBoard = <any>{
      columns: [
        { id: 1, tasks: [{ id: 1, text: 'test' }, { id: 2 }] },
        { id: 2 }
      ]
    };

    (<any>component.boardService.removeComment) = () => {
      return { subscribe: fn =>  fn(<any>{ alerts: [{}],
        data: [{}, [mockTask]]
      }) };
    };

    component.removeComment();
    expect((<any>component.activeBoard.columns[0].tasks[0]).text).toEqual('test');
  });

  it('has a function to check user comment admin', () => {
    component.activeUser = <any>{
      id: 2,
      isAnyAdmin: () => false
    }

    expect(component.canAdminComment(<any>{ user_id: 1 })).toEqual(false);

    component.activeUser.id = 1;
    expect(component.canAdminComment(<any>{ user_id: 1 })).toEqual(true);
  });

  it('has a function to show the editor for column task limit', () => {
    component.columnData = <any>{ task_limit: 3 };

    component.beginLimitEdit();
    expect(component.taskLimit).toEqual(3);
    expect(component.showLimitEditor).toEqual(true);
  });

  it('has a function to cancel editing for column task limit', () => {
    component.cancelLimitChanges();
    expect(component.showLimitEditor).toEqual(false);
  });

  it('calls a service to save column task limit changes', () => {
    component.columnData = <any>{ task_limit: 3 };
    component.taskLimit = 2;

    (<any>component.boardService.updateColumn) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'error', alerts: [{}] }) };
    };

    component.saveLimitChanges();
    expect(component.columnData.task_limit).toEqual(3);

    (<any>component.boardService.updateColumn) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'success', alerts: [], data: [
        {}, [{
          id: 1, name: 'test', position: 1,
          board_id: 1, task_limit: 2, ownTask: []
        }]
      ] }) };
    };

    component.saveLimitChanges();
    expect(component.columnData.task_limit).toEqual(2);
    expect(component.showLimitEditor).toEqual(false);
  });

  it('has a function to determine text color by bg color', () => {
    let color = component.getTextColor('#ffffff');

    expect(color).toEqual('#333333');

    color = component.getTextColor('#000000');

    expect(color).toEqual('#efefef');
  });

  it('can add a task with only a title', () => {
    let called = false;

    component.quickAdd = <any>{ title: 'test' };
    component.columnData = <any> { id: 1 };
    component.addTask = () => { called = true };

    component.quickAddClicked({ preventEnter: () => {} });
    expect(called).toEqual(true);
  });

  it('opens a model to add a task', () => {
    component.quickAdd = <any>{ title: '' };
    component.columnData = <any>{ id: 1 };

    component.quickAddClicked({ stopPropagation: () => {} });

    expect(component.modalProps.column_id).toEqual(1);
  })

  it('checks a due date against the current date', () => {
    component.checkDueDate();
    component.viewModalProps = <any>{ due_date: 'asdf' };
    component.checkDueDate();

    const today = new Date(),
      yesterday = new Date(
        today.getFullYear(), today.getMonth(), today.getDay() - 1
      );

    component.viewModalProps = <any>{ due_date: today };
    component.checkDueDate();

    expect(component.isNearlyDue).toEqual(true);

    component.viewModalProps = <any>{ due_date: yesterday };
    component.checkDueDate();

    expect(component.isOverdue).toEqual(true);
  });

  it('provides a function to remove a task', () => {
    const remove = component.getRemoveTaskFunction(3);

    expect(remove).toEqual(jasmine.any(Function));

    component.columnData = <any>{ id: 1 };
    remove();

    expect(component.taskToRemove).toEqual(3);
  });

  it('provides a function to show a modal', () => {
    const show = component.getShowModalFunction(3);

    expect(show).toEqual(jasmine.any(Function));

    component.columnData = <any>{ id: 1, tasks: [{
      id: 3, title: 'test', description: '', color: '#ffffe0', points: 1,
      position: 1, column_id: 1, comments: [], attachments: [],
      assignees: [{}], categories: [{}]
    }] };
    component.activeBoard = <any>{ users: [{}], categories: [{}] };
    show();

    expect(component.modalProps.column_id).toEqual(1);
  });

  it('provides a function to show a view modal', () => {
    const view = component.getShowViewModalFunction(3);

    expect(view).toEqual(jasmine.any(Function));

    component.showActivity = true;
    component.columnData = <any>{ id: 1, tasks: [{
      id: 3, title: 'test', description: '', color: '#ffffe0', points: 1,
      position: 1, column_id: 1, comments: [], attachments: [],
      assignees: [{}], categories: [{}]
    }] };
    (<any>component.boardService.getTaskActivity) = () => {
      return { subscribe: fn =>  fn(<any>{ data: [
        {}, [{ text: '', timestamp: '' }]
      ] }) };
    };

    view();

    expect(component.viewModalProps.column_id).toEqual(1);
  });

});

