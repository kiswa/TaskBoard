export class Board {
    constructor(public id: number = 0,
            public name: string = '',
            public is_active: boolean = true,
            public columns = [],
            public categories = [],
            public auto_actions = [],
            public users = []) {
    }
}

