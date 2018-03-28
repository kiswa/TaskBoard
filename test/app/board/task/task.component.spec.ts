import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

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

describe('TaskDisplay', () => {
  let component: TaskDisplay,
    fixture: ComponentFixture<TaskDisplay>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        SharedModule
      ],
      declarations: [
        TaskDisplay
      ],
      providers: [
        AuthService,
        NotificationsService,
        ModalService,
        StringsService,
        BoardService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDisplay);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements OnInit', () => {
    component.ngOnInit();

    component.taskData = <any>{ id: 1, description: '' };
    component.activeBoard = <any>{ id: 1, columns: [{ id: 1, name: 'test' }] };
    component.ngOnInit();

    component.taskData = <any>{ id: 1, description: '', due_date: '' };
    component.ngOnInit();

    component.taskData = <any>{ id: 1, description: '', due_date: '1/1/2018' };
    component.ngOnInit();

    const today = new Date();
    component.taskData = <any>{
      id: 1, description: '',
      due_date: (today.getMonth() + 1) + '/' +
        (today.getDate() + 1) + '/' + today.getFullYear()
    };
    component.ngOnInit();

    expect(component.taskData.id).toEqual(1);
  });

  it('parses task description markdown into text', () => {
    component.taskData = <any>{ description: '# Make this HTML' };
    component.activeBoard = <any>{ issue_trackers: [] }

    const actual = component.getTaskDescription()

    expect(actual).toEqual('<h1 id="make-this-html">Make this HTML</h1>\n ');
  });

  it('provides a custom style for percentage of task completed', () => {
    component.percentComplete = .5;

    const actual = component.getPercentStyle();

    expect((<any>actual).changingThisBreaksApplicationSecurity)
      .toContain('width: 50%;');
  });

  it('provides a custom title for percentage of task completed', () => {
    component.percentComplete = .5;
    component.strings = {
      boards_task: 'Task',
      boards_taskComplete: 'complete'
    };

    const actual = component.getPercentTitle();

    expect(actual).toEqual('Task 50% complete');
  });

  it('has a function to determine text color by bg color', () => {
    let color = component.getTextColor('#ffffff');

    expect(color).toEqual('#333333');

    color = component.getTextColor('#000000');

    expect(color).toEqual('#efefef');
  });

  it('calls a service to change a task\'s column', () => {
    const select = document.createElement('select'),
      option = document.createElement('option');

    select.id = 'columnsList1';
    select.selectedIndex = 0;
    option.value = '0';

    select.appendChild(option);
    document.body.appendChild(select);

    component.taskData = <any>{ id: 1 };
    component.changeTaskColumn();

    const secondOpt = document.createElement('option');

    secondOpt.value = '1';
    select.appendChild(secondOpt);
    select.selectedIndex = 1;

    (<any>component.boardService.updateTask) = () => {
      return { subscribe: fn =>  fn(<any>{
        status: 'success',
        alerts: [{}],
        data: [{}, {}, [{}]]
      }) };
    };

    component.changeTaskColumn();
    expect(component.taskData.column_id).toEqual(1);
  });

  it('updates context menu on boards changes', () => {
    component.activeBoard = <any>{ name: 'test', columns: [] };
    component.strings = <any>{
      boards_copyTaskTo: 'Copy To',
      boards_moveTaskTo: 'Move To'
    };
    component.taskData = <any>{ id: 1, description: '', due_date: '1/1/2018' };

    component.boards = <any>[{ id: 1, name: 'one' }, { id: 2, name: 'test' }];

    expect(component.contextMenuItems.length).toEqual(10);
  });

});

