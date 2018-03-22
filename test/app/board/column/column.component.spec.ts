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

});

