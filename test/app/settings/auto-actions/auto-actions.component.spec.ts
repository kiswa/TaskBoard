import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import { ActionTrigger } from '../../../../src/app/shared/models';
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
  AutoActions
} from '../../../../src/app/settings/auto-actions/auto-actions.component';

describe('AutoActions', () => {
  let component: AutoActions,
    fixture: ComponentFixture<AutoActions>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule
      ],
      declarations: [
        AutoActions
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
    fixture = TestBed.createComponent(AutoActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('updates the list of automatic actions', () => {
    component.boards = <any>[
      { is_active: false, id: 1, name: 'First' },
      { is_active: true, id: 2, name: 'Second' }
    ];
    component.updateActions(<any>[{ board_id: 1 }, { board_id: 2 }]);

    expect(component.loading).toEqual(false);
  });

  it('calls a service to add a new action', () => {
    (<any>component.actions).addAction = () => {
      return { subscribe: fn => { fn({ alerts: [{}], data: [{}, []] }); } };
    };

    component.addNewAction();

    expect(component.newAction.id).toEqual(0);
  });

  it('updates trigger sources', () => {
    component.boards = <any>[{
      id: 1
    }];

    component.newAction = <any>{
      trigger: ActionTrigger.MovedToColumn
    };
    component.updateTriggerSources();

    expect()
  });

});


