import { Component, Input } from '@angular/core';

@Component({
  selector: 'tb-my-items',
  templateUrl: './my-items.component.html'
})
export class MyItemsComponent {
  @Input()
  boards: any;

  @Input()
  boardsLoading: boolean;

  @Input()
  boardsMessage: string;

  @Input()
  tasks: any;

  @Input()
  tasksLoading: boolean;

  @Input()
  tasksMessage: string;

  @Input()
  strings: any[];

  constructor() {
    this.boardsLoading = true;
    this.tasksLoading = true;
  }

}

