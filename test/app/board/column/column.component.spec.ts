import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ColumnDisplayComponent } from 'src/app/board/column/column.component';
import { TaskDisplayComponent } from 'src/app/board/task/task.component';
import {
  AuthService,
  StringsService,
  ModalService,
  NotificationsService
} from 'src/app/shared/services';
import { BoardService } from 'src/app/board/board.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { User } from 'src/app/shared/models';

describe('ColumnDisplay', () => {
  let component: ColumnDisplayComponent;
  let fixture: ComponentFixture<ColumnDisplayComponent>;

  const mockTask = {
    id: 1, title: 'test', description: '', color: '#ffffe0', due: Date.now,
    points: 3, position: 1, column_id: 1,
    ownComment: [{
      id: 1, text: '', user_id: 1, task_id: 1, timestamp: Date.now()
    }],
    ownAttachment: [{
      id: 1, filename: 'file.png', diskfilename: 'asdfasdfasdf'
    }],
    sharedUser: [],
    sharedCategory: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
        SharedModule,
        DragDropModule,
      ],
      declarations: [
        ColumnDisplayComponent,
        TaskDisplayComponent,
      ],
      providers: [
        AuthService,
        NotificationsService,
        ModalService,
        StringsService,
        BoardService,
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: (_: any, val: string) => val,
            bypassSecurityTrustResourceUrl: (val: string) => val,
            bypassSecurityTrustHtml: (val: string) => val,
          },
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements OnInit', () => {
    component.userOptions = { multiple_tasks_per_row: true } as any;
    component.columnData = { id: 1, task_limit: 3, tasks: [] } as any;
    component.activeUser = { collapsed: [1] } as any;

    component.ngOnInit();

    expect(component.templateElement.classList.contains('collapsed')).toEqual(true);
  });

  it('gets a username', () => {
    component.activeBoard = <any>{ users: [<any>{ id: 1, username: 'hi' }] };
    const username = component.userName(1);

    expect(username).toEqual('hi');
  });

  it('sorts tasks', () => {
    component.columnData = { tasks: [
      { position: 2, due_date: '1/1/2018', points: 1 },
      { position: 1, due_date: '1/1/2019', points: 3 }
    ] } as any;

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
    (component.boardService.toggleCollapsed as any) = () => {
      return { subscribe: (fn: any) => fn({ data: [{}, [1]] } as any) };
    };
    component.activeUser = { id: 1, collapsed: [] } as any;
    component.columnData = { id: 1 } as any;

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
    const mock = [{ default_task_color: 'red' } as any];
    component.updateTaskColorByCategory(mock);

    expect(component.modalProps.categories).toEqual(mock);
    expect(component.modalProps.color).toEqual('red');
  });

  it('calls a service to add a task', () => {
    component.columnData = { id: 1 } as any;

    component.addTask();
    expect(component.saving).toEqual(false);

    (component.boardService.addTask as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'error', alerts: [{}] } as any) };
    };

    component.modalProps = { title: 'Testing' } as any;
    component.addTask();
    expect(component.saving).toEqual(false);

    (component.boardService.addTask as any) = () => {
      return { subscribe: (_: any, err: any) => { err('Err'); } }
    }
    component.addTask();

    (component.boardService.addTask as any) = () => {
      return { subscribe: (fn: any) => fn({
        status: 'success',
        alerts: [],
        data: [{}, {}, [{ ownColumn: [{}] }]]
      } as any) };
    };

    component.addTask();
    expect(component.saving).toEqual(false);
  });

  it('handles drop events', () => {
    const prev =  {
      data: {},
      element: {
        nativeElement: { id: 'col1' }
      }
    };
    const evt = {
      currentIndex: 0,
      previousContainer: prev,
      container: prev
    }

    component.activeBoard = {
      columns: [{ id: 1, tasks: [{ id: 1 }, { id: 2 }] }, { id: 3 }]
    } as any;
    component.moveItemInArray = () => true;
    component.transferArrayItem = () => true;

    component.drop(evt as any);
    expect(component.activeBoard.columns[0].tasks[0].position).toEqual(1);

    evt.previousContainer = {
      data: {},
      element: {
        nativeElement: { id: 'col1' }
      }
    };

    component.drop(evt as any);
    expect(component.activeBoard.columns[0].tasks[0].position).toEqual(1);
  });

  it('calls a service to update a task', () => {
    component.updateTask();
    expect(component.saving).toEqual(false);

    (component.boardService.updateTask as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'error', alerts: [{}] } as any) };
    };

    component.modalProps = { title: 'Testing' } as any;
    component.updateTask();
    expect(component.saving).toEqual(false);

    (component.boardService.updateTask as any) = () => {
      return { subscribe: (fn: any) => fn({
        status: 'success',
        alerts: [],
        data: [{}, {}, [{ ownColumn: [{}] }]]
      } as any) };
    };

    component.updateTask();
    expect(component.saving).toEqual(false);
    });

  it('calls a service to remove a task', () => {
    let called = false;
    component.taskToRemove = 1;

    (component.boardService.removeTask as any) = () => {
      return { subscribe: (fn: any) => {
        called = true;
        fn({ status: 'error', alerts: [{}] } as any);
      } };
    };

    component.removeTask();
    expect(called).toEqual(true);

    (component.boardService.removeTask as any) = () => {
      return { subscribe: (fn: any) => {
        called = true;
        fn({
          status: 'success',
          alerts: [{}],
          data: [{}, [{}]]
        } as any);
      } };
    };

    component.removeTask();
    expect(called).toEqual(true);
  });

  it('handles file input changes', () => {
    const file = { test: true };

    component.fileChange(file as any);
    expect(component.fileUpload).toEqual(file);
  });

  it('calls a service to add a file', () => {
    let called = false;

    component.notes.noteAdded.subscribe(() => { called = true; });
    component.addFile();

    expect(called).toEqual(true);

    component.fileUpload = {
      name: 'test.png',
      type: 'image/png',
    };
    component.activeUser = { id: 1 } as any;
    component.viewModalProps = { id: 1, attachments: [] } as any;

    (component.boardService.addAttachment as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'error' } as any) };
    };

    component.addFile();
    expect(component.fileUploading).toEqual(false);

    (component.boardService.addAttachment as any) = () => {
      return { subscribe: (fn: any) => fn({
        status: 'success',
        data: [{}, { id: 3, diskfilename: 'asdfghjkl' }],
        alerts: [{}]
      }) };
    };

    (component.boardService.uploadAttachment as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'success', alerts: [{}] }) };
    };

    component.addFile();
    expect(component.fileUploading).toEqual(false);
  });

  it('opens a file viewer in a new window', () => {
    spyOn(window, 'open');

    component.viewFile('asdf');

    expect(window.open).toHaveBeenCalledWith('./files/asdf', 'tb-file-view');
  });

  it('provides a way to get a the URL for a file', () => {
    const url = component.getUrl('asdf').toString();

    expect(url).toEqual('./api/uploads/asdf');
  });

  it('calls a service to remove a file', () => {
    (component.boardService.removeAttachment as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'error', alerts: [] }) };
    };

    component.activeUser = { id: 1, security_level: 3 } as any;
    component.attachmentToRemove = { id: 0 } as any;
    component.removeAttachment();

    (component.boardService.removeAttachment as any) = () => {
      return { subscribe: (fn: any) => fn({
        status: 'success',
        alerts: [{}],
      }) };
    };

    component.viewModalProps.attachments = [{ id: 0 } as any];
    component.removeAttachment();

    expect(component.viewModalProps.attachments.length).toEqual(0);
  });

  it('calls a service to add a comment', () => {
    component.viewModalProps.id = 0;
    component.addComment();

    component.activeUser = new User();
    component.viewModalProps.id = 1;
    component.newComment = 'Testing.';
    component.addComment();

    expect(component.newComment).toEqual('');

    (component.boardService.addComment as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'error', alerts: [] } as any) };
    };

    component.newComment = 'Testing.';
    component.addComment();
    expect(component.newComment).toEqual('');

    (component.boardService.addComment as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'success', data: [{}, [
        mockTask, { id: 2 }
      ]], alerts: [{}] } as any) };
    };

    component.activeBoard = {
      columns: [{ id: 1, tasks: [{ id: 1 }, { id: 2 }] }, { id: 3 }]
    } as any;

    component.addComment();
    expect(component.viewModalProps.id).toEqual(1);
  });

  it('loads a comment into the editor', () => {
    component.beginEditComment({ id: 1, text: 'Testing' } as any);
    expect(component.commentEdit.text).toEqual('Testing');
  });

  it('calls a service to edit a comment', () => {
    component.activeUser = { id: 1 } as any;
    component.commentEdit = { is_edited: false, user_id: 0 } as any;

    (component.boardService.updateComment as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'error', alerts: [{}] } as any) };
    };

    component.editComment();
    expect(component.commentEdit.is_edited).toEqual(true);

    component.activeBoard = {
      columns: [{ id: 1, tasks: [{ id: 1 }, { id: 2 }] }, { id: 2 }]
    } as any;

    (component.boardService.updateComment as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'success', alerts: [{}],
        data: [{}, [mockTask]]
      } as any) };
    };

    component.editComment();
    expect(component.viewModalProps.id).toEqual(1);
  });

  it('calls a service to remove a comment', () => {
    component.viewModalProps = { comments: [{ id: 1 }] } as any;
    component.commentToRemove = { id: 1 } as any;

    component.activeUser = { id: 1, security_level: 2 } as any;
    component.activeBoard = {
      columns: [
        { id: 1, tasks: [{ id: 1, text: 'test' }, { id: 2 }] },
        { id: 2 }
      ]
    } as any;

    (component.boardService.removeComment as any) = () => {
      return { subscribe: (fn: any) => fn({ alerts: [{}],
        data: [{}, [mockTask]]
      } as any) };
    };

    component.removeComment();
    expect((component.activeBoard.columns[0].tasks[0] as any).text).toEqual('test');
  });

  it('has a function to check user comment admin', () => {
    component.activeUser = {
      id: 2,
      isAnyAdmin: () => false
    } as any;

    expect(component.canAdminComment({ user_id: 1 } as any)).toEqual(false);

    component.activeUser.id = 1;
    expect(component.canAdminComment({ user_id: 1 } as any)).toEqual(true);
  });

  it('has a function to show the editor for column task limit', () => {
    component.columnData = { task_limit: 3 } as any;

    component.beginLimitEdit();
    expect(component.taskLimit).toEqual(3);
    expect(component.showLimitEditor).toEqual(true);
  });

  it('has a function to cancel editing for column task limit', () => {
    component.cancelLimitChanges();
    expect(component.showLimitEditor).toEqual(false);
  });

  it('calls a service to save column task limit changes', () => {
    component.columnData = { task_limit: 3 } as any;
    component.taskLimit = 2;

    (component.boardService.updateColumn as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'error', alerts: [{}] } as any) };
    };

    component.saveLimitChanges();
    expect(component.columnData.task_limit).toEqual(3);

    (component.boardService.updateColumn as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'success', alerts: [], data: [
        {}, [{
          id: 1, name: 'test', position: 1,
          board_id: 1, task_limit: 2, ownTask: []
        }]
      ] } as any) };
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

    component.quickAdd = { title: 'test' } as any;
    component.columnData = { id: 1 } as any;
    component.addTask = () => { called = true; };

    component.quickAddClicked({ preventEnter: () => {} });
    expect(called).toEqual(true);
  });

  it('opens a model to add a task', () => {
    component.quickAdd = { title: '' } as any;
    component.columnData = { id: 1 } as any;

    component.quickAddClicked({ stopPropagation: () => {} });

    expect(component.modalProps.column_id).toEqual(1);
  });

  it('checks a due date against the current date', () => {
    component.checkDueDate();
    component.viewModalProps = { due_date: 'asdf' } as any;
    component.checkDueDate();

    const today = new Date();
    const yesterday = new Date(
      today.getFullYear(), today.getMonth(), today.getDay() - 2
    );

    component.viewModalProps = { due_date: today } as any;
    component.checkDueDate();

    expect(component.isNearlyDue).toEqual(true);

    component.viewModalProps = { due_date: yesterday } as any;
    component.checkDueDate();

    expect(component.isOverdue).toEqual(true);
  });

  it('provides a function to remove a task', () => {
    const remove = component.getRemoveTaskFunction(3);

    expect(remove).toEqual(jasmine.any(Function));

    component.columnData = { id: 1 } as any;
    remove();

    expect(component.taskToRemove).toEqual(3);
  });

  it('provides a function to show a modal', () => {
    const show = component.getShowModalFunction(3);

    expect(show).toEqual(jasmine.any(Function));

    component.columnData = { id: 1, tasks: [{
      id: 3, title: 'test', description: '', color: '#ffffe0', points: 1,
      position: 1, column_id: 1, comments: [], attachments: [],
      assignees: [{}], categories: [{}]
    }] } as any;
    component.activeBoard = { users: [{}], categories: [{}] } as any;
    show();

    expect(component.modalProps.column_id).toEqual(1);
  });

  it('provides a function to show a view modal', () => {
    const view = component.getShowViewModalFunction(3);

    expect(view).toEqual(jasmine.any(Function));

    component.activeUser = { id: 1, security_level: 1 } as any;
    component.activeBoard = { issue_trackers: [] } as any;
    component.showActivity = true;
    component.columnData = { id: 1, tasks: [{
      id: 3, title: 'test', description: '', color: '#ffffe0', points: 1,
      position: 1, column_id: 1, comments: [], attachments: [],
      assignees: [{}], categories: [{}]
    }] } as any;

    (component.boardService.getTaskActivity as any) = () => {
      return { subscribe: (fn: any) =>  fn({ data: [
        {}, [{ text: '', timestamp: '' }]
      ] } as any) };
    };

    view();

    expect(component.viewModalProps.column_id).toEqual(1);
  });

  it('gets a username by user id', () => {
    component.activeBoard = {
      users: [{ id: 1, username: 'test' } as any]
    } as any;

    const uname = component.getUserName(1);

    expect(uname).toEqual('test');
  });

  it('can call board update with an emitter', () => {
    let called = false;

    component.onUpdateBoards.subscribe(() => { called = true; });

    component.callBoardUpdate();

    expect(called).toEqual(true);
  });

});
