export class User {
    constructor(public default_board_id: number = 0, // tslint:disable-line
                public email: string = '',
                public id: number = 0,
                public last_login: Date = null, // tslint:disable-line
                public security_level: number = 3, // tslint:disable-line
                public user_option_id: number = 0, // tslint:disable-line
                public username: string = '',
                public board_access: Array<number> = [], // tslint:disable-line
                public collapsed: Array<number> = []) {
    }
}

