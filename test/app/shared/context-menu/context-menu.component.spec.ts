import { TestBed, ComponentFixture } from '@angular/core/testing'
import { ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { SharedModule } from '../../../../src/app/shared/shared.module';

import {
  ContextMenuService
} from '../../../../src/app/shared/context-menu/context-menu.service';
import {
  ContextMenu
} from '../../../../src/app/shared/context-menu/context-menu.component';

class ElementRefMock {
  public nativeElement = { parentElement: {} };
}

describe('ContextMenu', () => {
  let component: ContextMenu,
    fixture: ComponentFixture<ContextMenu>,
    elementRef: ElementRefMock;

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
    fixture = TestBed.createComponent(ContextMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('captures parent oncontextmenu events', () => {
    let parentElement = component.el.nativeElement.parentElement;

    expect(parentElement.oncontextmenu).toEqual(jasmine.any(Function));

    parentElement.oncontextmenu({
      preventDefault: () => {},
      stopPropagation: () => {}
    });
  });

});

