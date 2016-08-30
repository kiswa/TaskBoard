import { User }  from '../../shared/index';

export class UserDisplay extends User {
    public default_board_name: string;
    public security_level_name: string;
    public can_admin: boolean;
}

export class ModalUser extends UserDisplay {
    public password: string = '';
    public verifyPassword: string = '';
    public boardAccess: Array<number> = [];
}

export class ModalProperties {
    constructor(public title: string,
        public prefix: string,
        public user: ModalUser) {
    }
}

