import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { DragulaService, DragulaModule } from 'ng2-dragula';

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
  BoardAdminComponent
} from '../../../../src/app/settings/board-admin/board-admin.component';

describe('BoardAdmin', () => {
  let component: BoardAdminComponent;
  let fixture: ComponentFixture<BoardAdminComponent>;

  const getPrivateFunction = (name: any) => component[name].bind(component);

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
        BoardAdminComponent
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
    fixture = TestBed.createComponent(BoardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('sets up drag and drop during ngAfterContentInit', () => {
    component.modalProps = { columns: [{ position: '' }] } as any;
    component.ngAfterContentInit();

    expect(component.modalProps.columns[0].position).toEqual('');
  });

  it('validates a board before saving', () => {
    component.modalProps = { columns: [] } as any;
    component.addEditBoard();

    expect(component.saving).toEqual(false);
  });

  it('calls a service to add a board', () => {
    component.modalProps = {
      title: 'Add',
      name: 'Test',
      columns: [{}]
    } as any;
    component.users = [{ selected: true }] as any;

    let called = false;

    (component.modal as any).isOpen = () => true;
    (component.boardService as any).addBoard = () => {
      return { subscribe: (fn: any) => {
        const board = new Board();
        fn({ status: 'success', alerts: [{}], data: [{}, [board]] });
        called = true;
      } };
    };

    component.addEditBoard();
    expect(called).toEqual(true);
  });

  it('calls a service to edit a board', () => {
    component.modalProps = {
      title: '',
      name: '',
      columns: [{}]
    } as any;
    component.users = [{}] as any;

    let called = false;

    (component.modal as any).isOpen = () => true;
    (component.boardService as any).editBoard = () => {
      return { subscribe: (fn: any) => {
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

    (component.boardService as any).removeBoard = () => {
      return { subscribe: (fn: any) => fn({ alerts: [], data: [{}, []] }) };
    };
    (component.settings as any).getActions = () => {
      return { subscribe: (fn: any) => {
        fn({ alerts: [], data: [{}, []] });
        called = true;
      } };
    };

    component.boardToRemove = { id: 1 } as any;
    component.removeBoard();

    expect(called).toEqual(true);
  });

  it('calls a service to toggle a board\'s status', () => {
    let called = false;

    (component.boardService as any).editBoard = () => {
      return { subscribe: (fn: any) => {
        const board = new Board();
        fn({ status: 'success', alerts: [{}], data: [{}, [board]] });
        called = true;
      } };
    };

    component.toggleBoardStatus({
      id: 1, name: 'Name', is_active: true, columns: [],
      categories: [], issue_trackers: [], users: []
    } as any);

    expect(called).toEqual(true);
  });

  it('can filter the list of boards by user', () => {
    component.boards = [
      { users: [{ id: 1 }] }
    ] as any;

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
    component.boards = [
      { is_active: true, users: [] }
    ] as any;

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
    component.boards = [
      { id: 1, name: 'last' },
      { id: 2, name: 'first' }
    ] as any;
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
    component.modalProps = { columns: [{ name: 'test' }] } as any;

    const actual = getPropertyValue('columns', 'name', 0);
    expect(actual).toEqual('test');
  });

  it('handles a property change', () => {
    const onPropertyEdit = getPrivateFunction('onPropertyEdit');
    component.modalProps = { columns: [{ name: 'test' }] } as any;

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
    component.modalProps = { categories: [{}] } as any;

    setCategoryColor('purple', 0);
    const actual = component.modalProps.categories[0].default_task_color;
    expect(actual).toEqual('purple');
  });

  it('can show a modal', () => {
    const showModal = getPrivateFunction('showModal');

    component.users = [{ selected: true }] as any;
    showModal('Add');

    expect((component.users[0] as any).selected).toEqual(false);

    showModal('Edit', new Board());
  });

  it('can show a confirmation modal', () => {
    const showConfirmModal = getPrivateFunction('showConfirmModal');

    showConfirmModal({ works: true } as any);

    expect((component.boardToRemove as any).works).toEqual(true);
  });

});

