import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SharedModule } from 'src/app/shared/shared.module';
import {
  InlineEditComponent
} from 'src/app/shared/inline-edit/inline-edit.component';

describe('InlineEdit', () => {
  let component: InlineEditComponent;
  let fixture: ComponentFixture<InlineEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineEditComponent);
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

    component.beginEdit(el as any);
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
    component.editDone('test', event as any);

    expect(called).toEqual(true);
    expect(component.isDisplay).toEqual(true);
    expect(component.text).toEqual('test');
  });

});

