import { Category } from './category.model';
import { User } from './user.model';

export class Task {
    constructor(public id: number = 0,
                public title: string = '',
                public description: string = '',
                public color: string = '',
                public due_date: string = '', // tslint:disable-line
                public points: number = 0,
                public position: number = 0,
                public column_id: number = 0, // tslint:disable-line
                public comments: Array<any> = [], // TODO: Use model
                public attachments: Array<any> = [], // TODO: Use model
                public assignees: Array<User> = [],
                public categories: Array<Category> = []) {
    }
}

