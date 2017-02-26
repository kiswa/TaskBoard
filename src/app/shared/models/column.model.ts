import { Task } from './task.model';

export class Column {
    constructor(public id: number = 0,
                public name: string = '',
                public position: number = 0,
                public board_id: number = 0, // tslint:disable-line
                public tasks: Array<Task> = []) {
    }
}

