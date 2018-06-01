import { Component } from '@angular/core';

@Component({
  selector: 'tb-context-menu-item',
  template:`<hr *ngIf="isSeparator;else inner_content">
    <ng-content #inner_content></ng-content>
  `
})
