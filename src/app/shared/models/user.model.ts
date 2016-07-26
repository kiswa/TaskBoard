export class User {
    constructor(public default_board_id: number = 0,
            public email: string = '',
            public id: number = 0,
            public last_login: Date = null,
            public security_level: number = 3,
            public user_option_id: number = 0,
            public username: string = '') {
    }
}

