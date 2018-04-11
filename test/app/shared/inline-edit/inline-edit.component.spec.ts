import { TestBed, ComponentFixture } from '@angular/core/testing'

import { SharedModule } from '../../../../src/app/shared/shared.module';

import {
  InlineEdit
} from '../../../../src/app/shared/inline-edit/inline-edit.component';

describe('InlineEdit', () => {
  let component: InlineEdit,
    fixture: ComponentFixture<InlineEdit>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('toggles display for edit mode', done => {
    expect(component.isDisplay).toEqual(true);

    let called = false;
    const el = { focus: () => called = true };

    component.beginEdit(<any>el);
    expect(component.isDisplay).toEqual(false);

    setTimeout(() => {
      expect(called).toEqual(true);
      done();
    }, 110);
  });

  it('updates values when editing is complete', () => {
    let called = false;
    const event = { stopPropagation: () => called = true };

    component.editDone('test');
    component.editDone('test', <any>event);

    expect(called).toEqual(true);
    expect(component.isDisplay).toEqual(true);
    expect(component.text).toEqual('test');
  });

});

