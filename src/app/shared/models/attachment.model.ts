export class Attachment {
  constructor(public id: number = 0,
              public filename: string = '',
              public diskfilename: string = '',
              public name: string = '',
              public type: string = '',
              public user_id: number = 0, // tslint:disable-line
              public timestamp: number = Date.now(),
              public task_id: number = 0,
              public data: any = null) { // tslint:disable-line
  }
}

