import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

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
import { BoardAdminService } from '../../../../src/app/settings/board-admin/board-admin.service';

import { BoardAdmin } from '../../../../src/app/settings/board-admin/board-admin.component';

describe('BoardAdmin', () => {
  let component: BoardAdmin,
    fixture: ComponentFixture<BoardAdmin>;

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
        SettingsService,
        BoardAdminService,
        DragulaService
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

  // it('calls a service to add a board', () => {
  //   component.modalProps.title = 'Add';
  //
  // });

});

