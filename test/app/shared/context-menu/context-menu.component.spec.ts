import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ElementRef } from '@angular/core';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import {
  ContextMenuService
} from '../../../../src/app/shared/context-menu/context-menu.service';
import {
  ContextMenuComponent
} from '../../../../src/app/shared/context-menu/context-menu.component';

class ElementRefMock {
  public nativeElement = { parentElement: {} };
}

describe('ContextMenu', () => {
  let component: ContextMenuComponent;
  let fixture: ComponentFixture<ContextMenuComponent>;
  let elementRef: ElementRefMock;

  beforeEach(() => {
    elementRef = new ElementRefMock();

    TestBed.configureTestingModule({
      imports: [ SharedModule ],
      providers: [
        ContextMenuService,
        { provide: ElementRef, useValue: elementRef }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('captures parent oncontextmenu events', () => {
    const parentElement = component.el.nativeElement.parentElement;

    expect(parentElement.oncontextmenu).toEqual(jasmine.any(Function));

    parentElement.oncontextmenu({
      preventDefault: () => {},
      stopPropagation: () => {}
    });
  });

});

