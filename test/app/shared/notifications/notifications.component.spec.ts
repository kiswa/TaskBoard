import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';

import { SharedModule } from '../../../../src/app/shared/shared.module';
import { NotificationsServiceMock } from '../../mocks';

import {
  NotificationsService
} from '../../../../src/app/shared/notifications/notifications.service';
import {
  NotificationsComponent
} from '../../../../src/app/shared/notifications/notifications.component';

describe('Notifications', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

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
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('subscribes to note add events', fakeAsync(() => {
    const note = { type: 'info' };
    (component.notifications as any).addNote(note);

    tick(4000);
    expect(note.type).toEqual('info clicked');
  }));

  it('hides notes', fakeAsync(() => {
    // tslint:disable-next-line
    const hide = component['hide'].bind(component);
    const note = { type: 'test' };

    component.notes = [note] as any;

    hide({});
    tick(4000);
    expect(note.type).toEqual('test');

    hide(note);
    tick(4000);
    expect(note.type).toEqual('test clicked');
  }));

});


