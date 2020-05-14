import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';

import {
  ContextMenuItemComponent
} from 'src/app/shared/context-menu/context-menu-item.component';

@Component({
  selector: 'tb-host-component',
  template: `<tb-context-menu-item [isSeparator]="true"></tb-context-menu-item>`
})
class TestHostComponent {
  @ViewChild(ContextMenuItemComponent, { static: false })
  public menuItem: ContextMenuItemComponent;
}

describe('ContextMenuItem', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextMenuItemComponent, TestHostComponent ]
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
    let pdCalled = false;
    let spCalled = false;

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

    pdCalled = false;
    spCalled = false;

    hostComponent.menuItem.isSeparator = false;
    hostComponent.menuItem.isCustomEvent = false;

    hostComponent.menuItem.el.nativeElement.onclick(evt);

    expect(pdCalled).toEqual(false);
    expect(spCalled).toEqual(false);
  });

  it('handles context menu clicks on the element', () => {
    let pdCalled = false;
    let spCalled = false;

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

