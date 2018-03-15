export class PassForm {
  constructor(public current: string = '', public newPass: string = '',
              public verPass: string = '', public submitted: boolean = false) {
  }
}

export class UsernameForm {
  constructor(public newName: string = '',
              public submitted: boolean = false) {
  }
}

export class EmailForm {
  constructor(public newEmail: string = '',
              public submitted: boolean = false) {
  }
}

