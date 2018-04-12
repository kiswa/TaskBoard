import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';

import { SharedModule } from '../../../../src/app/shared/shared.module';
import { NotificationsServiceMock } from '../../mocks';

import {
  NotificationsService
} from '../../../../src/app/shared/notifications/notifications.service';
import {
  Notifications
} from '../../../../src/app/shared/notifications/notifications.component';

describe('Notifications', () => {
  let component: Notifications,
    fixture: ComponentFixture<Notifications>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule
      ],
      providers: [{
        provide: NotificationsService, useClass: NotificationsServiceMock
      }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('subscribes to note add events', fakeAsync(done => {
    const note = { type: 'info' };
    (<any>component.notifications).addNote(note);

    tick(4000);
    expect(note.type).toEqual('info clicked');
  }));

  it('hides notes', fakeAsync(() => {
    const hide = component['hide'].bind(component),
      note = { type: 'test' };

    component.notes = <any>[note];

    hide({});
    tick(4000);
    expect(note.type).toEqual('test');

    hide(note);
    tick(4000);
    expect(note.type).toEqual('test clicked');
  }));

});


