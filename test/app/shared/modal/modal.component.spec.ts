import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import { ModalService } from '../../../../src/app/shared/services';
import { Modal } from '../../../../src/app/shared/modal/modal.component';

describe('Modal', () => {
  let component: Modal,
    fixture: ComponentFixture<Modal>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule
      ],
      providers: [ ModalService ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('calls the modal service to close', () => {
    component.modalId = 'MODAL';

    (<any>component.modalService).close = (id, checkBlocking) => {
      expect(id).toEqual('MODAL');
      expect(checkBlocking).toEqual(false);
    };

    component.close();

    (<any>component.modalService).close = (id, checkBlocking) => {
      expect(id).toEqual('MODAL');
      expect(checkBlocking).toEqual(true);
    };

    component.close(true);
  });

  it('filters click events', () => {
    window.event = <any>{};
    component.filterClick(null);

    let called = false;
    const event = { stopPropagation: () => called = true };

    component.filterClick(<any>event);
    expect(called).toEqual(true);
  });

  it('handles the Escape key', () => {
    const keyUp = component['keyup'].bind(component);

    (<any>component.modalService).close = (id, checkBlocking) => {
      expect(checkBlocking).toEqual(true);
    };

    keyUp(<any>{ keyCode: 27 });
  });

  it('handles the Enter key', () => {
    const keyUp = component['keyup'].bind(component);
    let called = false;

    component.defaultActionElement = { nativeElement: {
      click: () => called = true
    } };

    keyUp(<any>{ keyCode: 13 });
  });

});

