import { SafeHtml } from '@angular/platform-browser';

export class Comment {
  public html: SafeHtml;

  constructor(public id: number = 0,
              public text: string = '',
              public user_id: number = 0, // tslint:disable-line
              public task_id: number = 0, // tslint:disable-line
              public timestamp: number = Date.now(),
              public is_edited: boolean = false) { // tslint:disable-line
  }
}

