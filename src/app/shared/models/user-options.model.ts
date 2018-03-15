export class UserOptions {
  constructor(public id: number = 0,
              public new_tasks_at_bottom: boolean = true, // tslint:disable-line
              public show_animations: boolean = true, // tslint:disable-line
              public show_assignee: boolean = true, // tslint:disable-line
              public multiple_tasks_per_row: boolean = false, // tslint:disable-line
              public language: string = 'en') {
  }
}

