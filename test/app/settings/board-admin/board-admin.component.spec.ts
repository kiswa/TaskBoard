import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from '../../../../src/app/shared/services';
import { SettingsService } from '../../../../src/app/settings/settings.service';
import {
  BoardAdminService
} from '../../../../src/app/settings/board-admin/board-admin.service';
import { Board } from '../../../../src/app/shared/models';
import { DragulaMock, SettingsServiceMock, AuthServiceMock } from '../../mocks';

import {
  BoardAdmin
} from '../../../../src/app/settings/board-admin/board-admin.component';

describe('BoardAdmin', () => {
  let component: BoardAdmin,
    fixture: ComponentFixture<BoardAdmin>;

  const getPrivateFunction = name => component[name].bind(component);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule,
        DragulaModule
      ],
      declarations: [
        BoardAdmin
      ],
      providers: [
        AuthService,
        ModalService,
        NotificationsService,
        StringsService,
        BoardAdminService,
        { provide: DragulaService, useClass: DragulaMock },
        { provide: SettingsService, useClass: SettingsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('sets up drag and drop during ngAfterContentInit', () => {
    component.modalProps = <any>{ columns: [{ position: '' }] };
    component.ngAfterContentInit();

    expect((<any>component.dragula).opts.moves).toEqual(jasmine.any(Function));
    expect(component.modalProps.columns[0].position).toEqual('0');

    const test = (<any>component.dragula).opts.moves(null, null, {
      classList: { contains: () => false }
    });
    expect(test).toEqual(false);
  });

  it('validates a board before saving', () => {
    component.modalProps = <any>{ columns: [] };
    component.addEditBoard();

    expect(component.saving).toEqual(false);
  });

  it('calls a service to add a board', () => {
    component.modalProps = <any>{
      title: 'Add',
      name: 'Test',
      columns: [{}]
    };
    component.users = <any>[{ selected: true }];

    let called = false;

    (<any>component.boardService).addBoard = () => {
      return { subscribe: fn => {
        const board = new Board();
        fn({ status: 'success', alerts: [{}], data: [{}, [board]] });
        called = true;
      } };
    };

    component.addEditBoard();
    expect(called).toEqual(true);
  });

  it('calls a service to edit a board', () => {
    component.modalProps = <any>{
      title: '',
      name: '',
      columns: [{}]
    };
    component.users = <any>[{}];

    let called = false;

    (<any>component.boardService).editBoard = () => {
      return { subscribe: fn => {
        const board = new Board();
        fn({ status: 'success', alerts: [{}], data: [{}, [board]] });
        called = true;
      } };
    };

    component.addEditBoard();
    component.modalProps.name = 'Test';
    expect(called).toEqual(false);

    component.addEditBoard();
    expect(called).toEqual(true);
  });

  it('calls a service to remove a board', () => {
    let called = false;

    (<any>component.boardService).removeBoard = () => {
      return { subscribe: fn => fn({ alerts: [], data: [{}, []] }) };
    };
    (<any>component.settings).getActions = () => {
      return { subscribe: fn => {
        fn({ alerts: [], data: [{}, []] });
        called = true;
      } };
    };

    component.boardToRemove = <any>{ id: 1 };
    component.removeBoard();

    expect(called).toEqual(true);
  });

  it('calls a service to toggle a board\'s status', () => {
    let called = false;

    (<any>component.boardService).editBoard = () => {
      return { subscribe: fn => {
        const board = new Board();
        fn({ status: 'success', alerts: [{}], data: [{}, [board]] });
        called = true;
      } };
    };

    component.toggleBoardStatus(<any>{
      id: 1, name: 'Name', is_active: true, columns: [],
      categories: [], issue_trackers: [], users: []
    });

    expect(called).toEqual(true);
  });

  it('can filter the list of boards by user', () => {
    component.boards = <any>[
      { users: [{ id: 1 }] }
    ];

    component.filterBoards();
    expect(component.displayBoards.length).toEqual(1);

    component.userFilter = '1';

    component.filterBoards();
    expect(component.displayBoards.length).toEqual(1);

    component.userFilter = '2';

    component.filterBoards();
    expect(component.displayBoards.length).toEqual(0);
  });

  it('can filter the list of boards by status', () => {
    component.boards = <any>[
      { is_active: true, users: [] }
    ];

    component.filterBoards();
    expect(component.displayBoards.length).toEqual(1);

    component.statusFilter = '1';

    component.filterBoards();
    expect(component.displayBoards.length).toEqual(1);

    component.statusFilter = '0';

    component.filterBoards();
    expect(component.displayBoards.length).toEqual(0);
  });

  it('sorts the list of boards after filtering', () => {
    component.boards = <any>[
      { id: 1, name: 'last' },
      { id: 2, name: 'first' }
    ];
    component.sortFilter = 'name-asc';

    component.filterBoards();
    expect(component.displayBoards[0].name).toEqual('first');

    component.sortFilter = 'name-desc';

    component.filterBoards();
    expect(component.displayBoards[0].name).toEqual('last');

    component.sortFilter = 'id-asc';

    component.filterBoards();
    expect(component.displayBoards[0].id).toEqual(1);

    component.sortFilter = 'id-desc';

    component.filterBoards();
    expect(component.displayBoards[0].id).toEqual(2);
  });

  it('can stop enter key events from bubbling', () => {
    let called = false;

    component.cancelEnterKey({ stopPropagation: () => called = true });

    expect(called).toEqual(true);
  });

  it('can get a property value for the modal', () => {
    const getPropertyValue = getPrivateFunction('getPropertyValue');
    component.modalProps = <any>{ columns: [{ name: 'test' }] };

    const actual = getPropertyValue('columns', 'name', 0);
    expect(actual).toEqual('test');
  });

  it('handles a property change', () => {
    const onPropertyEdit = getPrivateFunction('onPropertyEdit');
    component.modalProps = <any>{ columns: [{ name: 'test' }] };

    onPropertyEdit('columns', 'name', 0, 'changed');
    expect(component.modalProps.columns[0].name).toEqual('changed');
  });

  it('gets a category color', () => {
    const getColor = getPrivateFunction('getColor');
    let actual = getColor({ default_task_color: 'red' });

    expect(actual).toEqual('red');

    actual = getColor({ defaultColor: 'orange' });
    expect(actual).toEqual('orange');
  });

  it('can set a category color', () => {
    const setCategoryColor = getPrivateFunction('setCategoryColor');
    component.modalProps = <any>{ categories: [{}] };

    setCategoryColor('purple', 0);
    const actual = component.modalProps.categories[0].default_task_color;
    expect(actual).toEqual('purple');
  });

  it('can show a modal', () => {
    const showModal = getPrivateFunction('showModal');

    component.users = <any>[{ selected: true }];
    showModal('Add');

    expect((<any>component.users[0]).selected).toEqual(false);

    showModal('Edit', new Board());
  });

  it('can show a confirmation modal', () => {
    const showConfirmModal = getPrivateFunction('showConfirmModal');

    showConfirmModal(<any>{ works: true });

    expect((<any>component.boardToRemove).works).toEqual(true);
  });

});

