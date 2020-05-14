import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { TaskDisplayComponent } from 'src/app/board/task/task.component';
import {
  AuthService,
  StringsService,
  ModalService,
  NotificationsService
} from 'src/app/shared/services';
import { BoardService } from 'src/app/board/board.service';
import { SharedModule } from 'src/app/shared/shared.module';

describe('TaskDisplay', () => {
  let component: TaskDisplayComponent;
  let fixture: ComponentFixture<TaskDisplayComponent>;

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
        TaskDisplayComponent
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
    fixture = TestBed.createComponent(TaskDisplayComponent);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements OnInit', () => {
    component.taskData = { id: 1, description: '' } as any;
    component.activeBoard = { id: 1, columns: [{ id: 1, name: 'test' }] } as any;
    component.ngOnInit();

    component.taskData = { id: 1, description: '', due_date: '' } as any;
    component.ngOnInit();

    component.taskData = { id: 1, description: '', due_date: '1/1/2018' } as any;
    component.ngOnInit();

    const today = new Date();
    component.taskData = {
      id: 1, description: '',
      due_date: (today.getMonth() + 1) + '/' +
        (today.getDate() + 1) + '/' + today.getFullYear()
    } as any;
    component.ngOnInit();

    expect(component.taskData.id).toEqual(1);
  });

  it('parses task description markdown into text', done => {
    setupBoard();
    component.taskData.description = '# Make this HTML';
    component.activeBoard.issue_trackers = [
      { id: 1, regex: 'test', url: '%BUGID%' }
    ];
    component.ngOnInit();

    setTimeout(() => {
      // tslint:disable-next-line
      expect(component.taskData.html['changingThisBreaksApplicationSecurity'])
        .toEqual('<h1 id="make-this-html">Make this HTML</h1>\n');
      done();
    }, 100);
  });

  it('handles checklists in markdown', done => {
    setupBoard();
    component.taskData.description = ' - [x] One\n - [ ] Two';
    component.ngOnInit();

    setTimeout(() => {
      // tslint:disable-next-line
      expect(component.taskData.html['changingThisBreaksApplicationSecurity'])
        .toEqual('<ul>\n<li><i class="icon icon-check"></i>One</li>\n' +
          '<li><i class="icon icon-check-empty"></i>Two</li>\n</ul>\n');
      done();
    }, 100);
  });

  it('adds attributes to links in markdown', done => {
    setupBoard();
    component.taskData.description = '[link](google.com)';
    component.ngOnInit();

    setTimeout(() => {
      // tslint:disable-next-line
      expect(component.taskData.html['changingThisBreaksApplicationSecurity'])
        .toContain('target="tb_external" rel="noreferrer"');
      done();
    }, 100);
  });

  it('handles issue trackers in markdown', done => {
    setupBoard();
    component.activeBoard.issue_trackers = [
      { id: 1, url: 'TaskBoard/issues/%BUGID%', regex: '(?:Issue)?#(\\d+)' }
    ];

    component.taskData.description = '#123';
    component.ngOnInit();

    setTimeout(() => {
      // tslint:disable-next-line
      expect(component.taskData.html['changingThisBreaksApplicationSecurity'])
        .toContain('href="TaskBoard/issues/123"');
      done();
    }, 100);
  });;

  it('provides a custom style for percentage of task completed', done => {
    component.percentComplete = .5;

    const actual = component.getPercentStyle();

    setTimeout(() => {
      // tslint:disable-next-line
      expect((actual as any)['changingThisBreaksApplicationSecurity'])
        .toContain('width: 50%;');
      done();
    }, 100);
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
    const select = document.createElement('select');
    const option = document.createElement('option');

    select.id = 'columnsList1';
    select.selectedIndex = 0;
    option.value = '0';

    select.appendChild(option);
    document.body.appendChild(select);

    component.taskData = { id: 1 } as any;
    component.changeTaskColumn(eventMock);

    const secondOpt = document.createElement('option');

    secondOpt.value = '1';
    select.appendChild(secondOpt);
    select.selectedIndex = 1;

    (component.boardService.updateTask as any) = () => {
      return { subscribe: (fn: any) =>  fn({
        status: 'success',
        alerts: [{}],
        data: [{}, {}, [{}]]
      } as any) };
    };

    component.changeTaskColumn(eventMock);
    expect(component.taskData.column_id).toEqual(1);
  });

  it('calls a service to copy a task to another board', () => {
    const sel = document.createElement('select');
    const opt = document.createElement('option');

    sel.id = 'boardsList1Copy';
    sel.selectedIndex = 0;
    opt.value = '1';

    sel.appendChild(opt);
    document.body.appendChild(sel);

    component.strings = { boards_copyTaskTo: 'Copy To' } as any;
    component.taskData = { id: 1 } as any;
    component.boardsList = [
      { id: 1, name: 'one', columns: [{ id: 1 }] },
      { id: 2, name: 'test' }
    ] as any;

    let emitted = false;

    component.onUpdateBoards.subscribe(() => emitted = true);

    (component.boardService.addTask as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'success' } as any) };
    };

    component.copyTaskToBoard(eventMock);

    (component.boardService.addTask as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'asdf', alerts: [{}] } as any) };
    };

    component.copyTaskToBoard(eventMock);

    expect(emitted).toEqual(true);
  });

  it('calls a service to move a task to another board', () => {
    const sel = document.createElement('select');
    const opt = document.createElement('option');

    sel.id = 'boardsList1Move';
    sel.selectedIndex = 0;
    opt.value = '1';

    sel.appendChild(opt);
    document.body.appendChild(sel);

    component.strings = { boards_moveTaskTo: 'Move To' } as any;
    component.taskData = { id: 1 } as any;
    component.boardsList = [
      { id: 1, name: 'one', columns: [{ id: 1 }] },
      { id: 2, name: 'test' }
    ] as any;

    let emitted = false;

    component.onUpdateBoards.subscribe(() => emitted = true);

    (component.boardService.updateTask as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'success' } as any) };
    };

    component.moveTaskToBoard(eventMock);

    (component.boardService.updateTask as any) = () => {
      return { subscribe: (fn: any) => fn({ status: 'asdf', alerts: [{}] } as any) };
    };

    component.moveTaskToBoard(eventMock);

    expect(emitted).toEqual(true);
  });

  function setupBoard() {
    const today = new Date();

    component.activeBoard = {
      id: 1,
      columns: [{ id: 1, name: 'test' }],
      issue_trackers: []
    } as any;

    component.taskData = {
      id: 1, description: '',
      due_date: (today.getMonth() + 1) + '/' +
        (today.getDate() + 1) + '/' + today.getFullYear()
    } as any;
  }
});

