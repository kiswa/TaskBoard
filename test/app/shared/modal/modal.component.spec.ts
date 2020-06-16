import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { ModalService } from 'src/app/shared/services';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

describe('Modal', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

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
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('calls the modal service to close', () => {
    component.modalId = 'MODAL';

    (component.modalService as any).close =
      (id: string, checkBlocking: boolean) => {
        expect(id).toEqual('MODAL');
        expect(checkBlocking).toEqual(false);
      };

    component.close();

    (component.modalService as any).close =
      (id: string, checkBlocking: boolean) => {
        expect(id).toEqual('MODAL');
        expect(checkBlocking).toEqual(true);
      };

    component.close(true);
  });

  it('filters click events', () => {
    (window as any).event = {} as any;
    component.filterClick(null);

    let called = false;
    const event = { stopPropagation: () => called = true };

    component.filterClick(event as any);
    expect(called).toEqual(true);
  });

  it('handles the Escape key', () => {
    // tslint:disable-next-line
    const keyUp = component['keyup'].bind(component);

    (component.modalService as any).close =
      (_: any, checkBlocking: boolean) => {
        expect(checkBlocking).toEqual(true);
      };

    keyUp({ key: 'Escape' } as any);
  });

  it('handles the Enter key', () => {
    // tslint:disable-next-line
    const keyUp = component['keyup'].bind(component);
    let called = false;

    component.defaultActionElement = { nativeElement: {
      click: () => called = true
    } };

    keyUp({ key: 'Enter' } as any);
    expect(called).toEqual(true);
  });

});

