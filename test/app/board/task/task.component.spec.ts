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

    expect(component.taskData.id).toEqual(1);
  });

  it('parses task description markdown into text', () => {
    component.taskData = <any>{ description: '# Make this HTML' };
    component.activeBoard = <any>{ issue_trackers: [] }

    const actual = component.getTaskDescription()
    console.log()

    expect(actual).toEqual('<h1 id="make-this-html">Make this HTML</h1>\n ');
  });
});

