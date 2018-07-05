import { TestBed, ComponentFixture } from '@angular/core/testing';
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
  ModalService,
  NotificationsService
} from '../../../../src/app/shared/services';
import { BoardService } from '../../../../src/app/board/board.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';

describe('TaskDisplay', () => {
  let component: TaskDisplay,
    fixture: ComponentFixture<TaskDisplay>;

  const eventMock = {
    target: {
      tagName: 'SELECT',
      parentElement: {
        parentElement: { click: () => {} }
      }
    }
  };

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
    setupBoard();
    component.taskData.description = '# Make this HTML';
    component.activeBoard.issue_trackers = <any>[
      { regex: 'test', url: '%BUGID%' }
    ];
    component.ngOnInit();

    expect(component.taskData.html['changingThisBreaksApplicationSecurity'])
      .toEqual('<h1 id="make-this-html">Make this HTML</h1>\n');
  });

  it('handles checklists in markdown', () => {
    setupBoard();
    component.taskData.description = ' - [x] One\n - [ ] Two';
    component.ngOnInit();

    expect(component.taskData.html['changingThisBreaksApplicationSecurity'])
      .toEqual('<ul>\n<li><i class="icon icon-check"></i>One</li>\n' +
        '<li><i class="icon icon-check-empty"></i>Two</li>\n</ul>\n');
  });

  it('adds attributes to links in markdown', () => {
    setupBoard();
    component.taskData.description = '[link](google.com)';
    component.ngOnInit();

    expect(component.taskData.html['changingThisBreaksApplicationSecurity'])
      .toContain('target="tb_external" rel="noreferrer"');
  });

  it('provides a custom style for percentage of task completed', () => {
    component.percentComplete = .5;

    const actual = component.getPercentStyle();

    expect((<any>actual)['changingThisBreaksApplicationSecurity'])
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
    component.changeTaskColumn(eventMock);

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

    component.changeTaskColumn(eventMock);
    expect(component.taskData.column_id).toEqual(1);
  });

  it('calls a service to copy a task to another board', () => {
    const sel = document.createElement('select'),
      opt = document.createElement('option');

    sel.id = 'boardsList1Copy';
    sel.selectedIndex = 0;
    opt.value = '1';

    sel.appendChild(opt);
    document.body.appendChild(sel);

    component.strings = <any>{ boards_copyTaskTo: 'Copy To' };
    component.taskData = <any>{ id: 1 };
    component.boardsList = <any>[
      { id: 1, name: 'one', columns: [{ id: 1 }] },
      { id: 2, name: 'test' }
    ];

    let emitted = false;

    component.onUpdateBoards.subscribe(() => emitted = true);

    (<any>component.boardService.addTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'success' }) };
    };

    component.copyTaskToBoard(eventMock);

    (<any>component.boardService.addTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'asdf', alerts: [{}] }) };
    };

    component.copyTaskToBoard(eventMock);

    expect(emitted).toEqual(true);
  });

  it('calls a service to move a task to another board', () => {
    const sel = document.createElement('select'),
      opt = document.createElement('option');

    sel.id = 'boardsList1Move';
    sel.selectedIndex = 0;
    opt.value = '1';

    sel.appendChild(opt);
    document.body.appendChild(sel);

    component.strings = <any>{ boards_moveTaskTo: 'Move To' };
    component.taskData = <any>{ id: 1 };
    component.boardsList = <any>[
      { id: 1, name: 'one', columns: [{ id: 1 }] },
      { id: 2, name: 'test' }
    ];

    let emitted = false;

    component.onUpdateBoards.subscribe(() => emitted = true);

    (<any>component.boardService.updateTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'success' }) };
    };

    component.moveTaskToBoard(eventMock);

    (<any>component.boardService.updateTask) = () => {
      return { subscribe: fn =>  fn(<any>{ status: 'asdf', alerts: [{}] }) };
    };

    component.moveTaskToBoard(eventMock);

    expect(emitted).toEqual(true);
  });

  function setupBoard() {
    const today = new Date();

    component.activeBoard = <any>{
      id: 1,
      columns: [{ id: 1, name: 'test' }],
      issue_trackers: []
    };
    component.taskData = <any>{
      id: 1, description: '',
      due_date: (today.getMonth() + 1) + '/' +
        (today.getDate() + 1) + '/' + today.getFullYear()
    };
  }
});

