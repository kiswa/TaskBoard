import { Attachment } from './attachment.model';
import { Category } from './category.model';
import { Comment } from './comment.model';
import { User } from './user.model';

export class Task {
    public comments: Array<Comment>;
    public attachments: Array<Attachment>;
    public assignees: Array<User>;
    public categories: Array<Category>;

    public filtered: boolean;
    public hideFiltered: boolean;

    constructor(public id: number = 0,
                public title: string = '',
                public description: string = '',
                public color: string = '#ffffe0',
                public due_date: string = '', // tslint:disable-line
                public points: number = 0,
                public position: number = 0,
                public column_id: number = 0, // tslint:disable-line
                commentArray: Array<any> = [],
                attachmentArray: Array<any> = [],
                assigneeArray: Array<any> = [],
                categoryArray: Array<any> = []) {
        this.comments = [];
        this.attachments = [];
        this.assignees = [];
        this.categories = [];

        commentArray.forEach((comment: any) => {
            this.comments.push(new Comment(+comment.id,
                                           comment.text,
                                           +comment.user_id,
                                           +comment.task_id,
                                           +comment.timestamp));
        });

        attachmentArray.forEach((attachment: any) => {
            this.attachments.push(new Attachment(+attachment.id,
                                                 attachment.filename,
                                                 attachment.name,
                                                 attachment.type,
                                                 +attachment.user_id,
                                                 +attachment.timestamp,
                                                 +attachment.task_id));
        });

        assigneeArray.forEach((user: any) => {
            this.assignees.push(new User(+user.default_board_id,
                                         user.email,
                                         +user.id,
                                         user.last_login,
                                         +user.security_level,
                                         +user.user_option_id,
                                         user.username,
                                         user.board_access,
                                         user.collapsed));
        });

        categoryArray.forEach((category: any) => {
            this.categories.push(new Category(+category.id,
                                              category.name,
                                              category.default_task_color,
                                              +category.board_id));
        });
    }
}

