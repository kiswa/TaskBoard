import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';

import {
  ContextMenuItem
} from '../../../../src/app/shared/context-menu/context-menu-item.component';

@Component({
  selector: 'host-component',
  template: `<tb-context-menu-item [isSeparator]="true"></tb-context-menu-item>`
})
class TestHostComponent {
  @ViewChild(ContextMenuItem)
  public menuItem: ContextMenuItem;
}

describe('ContextMenuItem', () => {
  let hostComponent: TestHostComponent,
    hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextMenuItem, TestHostComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('can be constructed', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('handles clicks on the element', () => {
    let pdCalled = false,
      spCalled = false;

    const evt = {
      preventDefault: () => {
        pdCalled = true;
      },
      stopPropagation: () => {
        spCalled = true;
      }
    };

    hostComponent.menuItem.el.nativeElement.onclick(evt);

    expect(pdCalled).toEqual(true);
    expect(spCalled).toEqual(true);
  });

  it('handles context menu clicks on the element', () => {
    let pdCalled = false,
      spCalled = false;

    const evt = {
      preventDefault: () => {
        pdCalled = true;
      },
      stopPropagation: () => {
        spCalled = true;
      }
    };

    hostComponent.menuItem.el.nativeElement.oncontextmenu(evt);

    expect(pdCalled).toEqual(true);
    expect(spCalled).toEqual(true);
  });

});

