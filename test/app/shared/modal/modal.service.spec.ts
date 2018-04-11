import { RouterTestingModule } from '@angular/router/testing';
import { TestBed, getTestBed } from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { SharedModule } from '../../../../src/app/shared/shared.module';
import { AuthService } from '../../../../src/app/shared/services';

import { ModalService } from '../../../../src/app/shared/modal/modal.service';

describe('ModalService', () => {
  let injector: TestBed;
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        SharedModule
      ],
      providers: [ModalService, AuthService]
    });

    injector = getTestBed();
    service = injector.get(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('allows a modal to register', () => {
    service.registerModal(<any>{ modalId: 'MODAL' });

    expect(service['modals'].length).toEqual(1);
  });

  it('overwrites when registering same modalId', () => {
    service.registerModal(<any>{ modalId: 'MODAL' });
    service.registerModal(<any>{ modalId: 'MODAL' });

    expect(service['modals'].length).toEqual(1);
  });

  it('can open a modal', done => {
    const modal = <any>{
      modalId: 'TEST',
      focusElement: {
        nativeElement: {
          focus: () => {}
        }
      }
    };

    service['modals'].push(modal);
    service['userOptions'] = <any>{ show_animations: true };

    service.open(modal.modalId);

    setTimeout(() => {
      expect(modal.isOpen).toEqual(true);

      modal.focusElement = null;
      service.open(modal.modalId);
      service.open('nope');

      done();
    }, 110);
  });

  it('can close a modal', () => {
    const modal = <any>{
      modalId: 'TEST',
      blocking: true
    };

    service['modals'].push(modal);

    service.close('nope');

    service.close('TEST');
    expect(modal.isOpen).toEqual(false);

    modal.isOpen = true;
    service.close('TEST', true);
    expect(modal.isOpen).toEqual(true);
  });

});

