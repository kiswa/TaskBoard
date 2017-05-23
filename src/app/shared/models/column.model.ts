import { Task } from './task.model';

export class Column {
    public tasks: Array<Task>;

    constructor(public id: number = 0,
                public name: string = '',
                public position: number = 0,
                public board_id: number = 0, // tslint:disable-line
                ownTask: Array<any> = []) {
        this.tasks = [];

        ownTask.forEach((task: any) => {
            this.tasks.push(new Task(+task.id,
                                     task.title,
                                     task.description,
                                     task.color,
                                     task.due_date,
                                     +task.points,
                                     +task.position,
                                     +task.column_id,
                                     task.comments,
                                     task.attachments,
                                     task.assignees,
                                     task.categories));
        });
    }
}

