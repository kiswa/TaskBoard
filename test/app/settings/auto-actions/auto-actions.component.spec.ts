import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import {
  ActionTrigger,
  ActionType
} from '../../../../src/app/shared/models';
import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from '../../../../src/app/shared/services';
import { SettingsService } from '../../../../src/app/settings/settings.service';
import {
  AutoActionsService
} from '../../../../src/app/settings/auto-actions/auto-actions.service';
import {
  AutoActionsComponent
} from '../../../../src/app/settings/auto-actions/auto-actions.component';

describe('AutoActions', () => {
  let component: AutoActionsComponent;
  let fixture: ComponentFixture<AutoActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule
      ],
      declarations: [
        AutoActionsComponent
      ],
      providers: [
        AuthService,
        ModalService,
        NotificationsService,
        StringsService,
        SettingsService,
        AutoActionsService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('updates the list of automatic actions', () => {
    component.boards = [
      { is_active: false, id: 1, name: 'First' },
      { is_active: true, id: 2, name: 'Second' }
    ] as any;
    component.updateActions([{ board_id: 1 }, { board_id: 2 }] as any);

    expect(component.loading).toEqual(false);
  });

  it('calls a service to add a new action', () => {
    (component.actions as any).addAction = () => {
      return { subscribe: (fn: any) => { fn({ alerts: [{}], data: [{}, []] }); } };
    };

    component.addNewAction();

    expect(component.newAction.id).toEqual(0);
  });

  it('updates trigger sources', () => {
    component.boards = [{
      id: 1,
      columns: [{ id: 1, name: 'TestCol' }],
      users: [{ id: 1, username: 'tester' }],
      categories: [{ id: 1, name: 'TestCat' }]
    }, { id: 2 }] as any;

    component.newAction = {
      trigger: ActionTrigger.MovedToColumn,
      board_id: 1
    } as any;
    component.updateTriggerSources();

    expect(component.triggerSources.length).toEqual(2);

    component.newAction = {
      trigger: ActionTrigger.AssignedToUser,
      board_id: 1
    } as any;
    component.updateTriggerSources();

    expect(component.triggerSources.length).toEqual(2);

    component.newAction = {
      trigger: ActionTrigger.AddedToCategory,
      board_id: 1
    } as any;
    component.updateTriggerSources();

    expect(component.triggerSources.length).toEqual(2);

    component.newAction = {
      trigger: ActionTrigger.PointsChanged,
      board_id: 1
    } as any;
    component.updateTriggerSources();

    expect(component.types.length).toEqual(1);

    component.newAction = { trigger: -1 } as any;
    component.typesList = null;
    component.updateTriggerSources();

    expect(component.newAction.type).toEqual(ActionType.SetColor);
  });

  it('updates action sources', () => {
    component.boards = [{
      id: 1,
      columns: [{ id: 1, name: 'TestCol' }],
      users: [{ id: 1, username: 'tester' }],
      categories: [{ id: 1, name: 'TestCat' }]
    }, { id: 2 }] as any;

    component.newAction = {
      type: ActionType.SetCategory,
      board_id: 1
    } as any;
    component.updateActionSources();

    expect(component.actionSources.length).toEqual(2);

    component.newAction = {
      type: ActionType.AddCategory,
      board_id: 1
    } as any;
    component.updateActionSources();

    expect(component.actionSources.length).toEqual(2);

    component.newAction = {
      type: ActionType.SetAssignee,
      board_id: 1
    } as any;
    component.updateActionSources();

    expect(component.actionSources.length).toEqual(2);

    component.newAction = {
      type: ActionType.AddAssignee,
      board_id: 1
    } as any;
    component.updateActionSources();

    expect(component.actionSources.length).toEqual(2);

    component.newAction = { type: ActionType.SetColor } as any;
    component.updateActionSources();

    expect(component.newAction.change_to).toEqual('#000000');
  });

  it('provides the name of a board by its ID', () => {
    component.boards = [{ id: 1, name: 'Test' }] as any;

    let actual = component.getBoardName(1);
    expect(actual).toEqual('Test*');

    actual = component.getBoardName(2);
    expect(actual).toEqual('');
  });

  it('provides the description of an action\'s trigger', () => {
    component.strings = {
      settings_triggerMoveToColumn: 'Move To Column',
      settings_triggerAssignedToUser: 'Assigned To User',
      settings_triggerAddedToCategory: 'Added To Category',
      settings_triggerPointsChanged: 'Points Changed'
    };
    component.boards = [{
      id: 1,
      columns: [{ id: 1, name: 'Test' }],
      users: [{ id: 1, username: 'tester' }],
      categories: [{ id: 1, name: 'Test' }]
    }] as any;

    const action = {
      source_id: 1,
      board_id: 0,
      trigger: ActionTrigger.MovedToColumn
    } as any;
    let actual = component.getTriggerDescription(action);

    expect(actual).toEqual(undefined);

    action.board_id = 1;
    actual = component.getTriggerDescription(action);

    expect(actual).toEqual('Move To Column Test');

    action.trigger = ActionTrigger.AssignedToUser;
    actual = component.getTriggerDescription(action);

    expect(actual).toEqual('Assigned To User tester');

    action.trigger = ActionTrigger.AddedToCategory;
    actual = component.getTriggerDescription(action);

    expect(actual).toEqual('Added To Category Test');

    action.trigger = ActionTrigger.PointsChanged;
    actual = component.getTriggerDescription(action);

    expect(actual).toEqual('Points Changed');
  });

  it('provides HTML for the description of an action\'s type', () => {
    component.boards = [{
      id: 1,
      columns: [{ id: 1, name: 'Test' }],
      users: [{ id: 1, username: 'tester' }],
      categories: [{ id: 1, name: 'Test' }]
    }] as any;

    const action = {
      change_to: 'red',
      board_id: 0,
      type: ActionType.SetColor
    } as any;
    const safeValuePre = 'SafeValue must use [property]=binding: undefined ';
    const safeValuePost = ' (see http://g.co/ng/security#xss)';
    let actual = component.getTypeDescription(action);

    expect(actual).toEqual(undefined);

    action.board_id = 1;
    actual = component.getTypeDescription(action);

    expect(actual.toString())
      .toEqual(
        safeValuePre + '<span style="background-color: red;">red</span>' + safeValuePost
      );

    action.type = ActionType.SetCategory;
    action.change_to = 1;

    actual = component.getTypeDescription(action);

    expect(actual.toString()).toEqual(safeValuePre + 'Test' + safeValuePost);

    action.type = ActionType.AddCategory;
    action.change_to = 1;

    actual = component.getTypeDescription(action);

    expect(actual.toString()).toEqual(safeValuePre + 'Test' + safeValuePost);

    action.type = ActionType.SetAssignee;
    action.change_to = 1;

    actual = component.getTypeDescription(action);

    expect(actual.toString()).toEqual(safeValuePre + 'tester' + safeValuePost);

    action.type = ActionType.AddAssignee;
    action.change_to = 1;

    actual = component.getTypeDescription(action);

    expect(actual.toString()).toEqual(safeValuePre + 'tester' + safeValuePost);

    action.type = ActionType.ClearDueDate;
    action.change_to = 1;

    actual = component.getTypeDescription(action);

    expect(actual.toString()).toEqual(safeValuePre + safeValuePost.trim());

    action.type = ActionType.AlterColorByPoints;
    action.change_to = 1;

    actual = component.getTypeDescription(action);

    expect(actual.toString()).toEqual(safeValuePre + safeValuePost.trim());
  });

  it('calls aservice to remove an automatic action', () => {
    (component.actions as any).removeAction = () => {
      return { subscribe: (fn: any) => { fn({ alerts: [], data: [{}, []] }); } };
    };

    component.saving = true;
    component.removeAutoAction();

    expect(component.saving).toEqual(false);
  });

});


