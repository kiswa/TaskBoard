export class User {
    constructor(public default_board_id: number = 0, // tslint:disable-line
                public email: string = '',
                public id: number = 0,
                public last_login: Date = null, // tslint:disable-line
                public security_level: number = 4, // tslint:disable-line
                public user_option_id: number = 0, // tslint:disable-line
                public username: string = '',
                public board_access: Array<number> = [], // tslint:disable-line
                public collapsed: Array<number> = []) {
    }

    isAdmin() {
        return this.security_level === 1;
    }

    isBoardAdmin() {
        return this.security_level === 2;
    }

    isAnyAdmin() {
        return this.security_level === 1 || this.security_level === 2;
    }
}

