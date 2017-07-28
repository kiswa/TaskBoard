import { AutoAction } from './auto-actions.model';
import { Column } from './column.model';
import { Category } from './category.model';
import { IssueTracker } from './issue-tracker.model';
import { User } from './user.model';

export class Board {
    public columns: Array<Column>;
    public categories: Array<Category>;
    public auto_actions: Array<AutoAction>; // tslint:disable-line
    public issue_trackers: Array<IssueTracker>; // tslint:disable-line
    public users: Array<User>;

    constructor(public id: number = 0,
                public name: string = '',
                public is_active: boolean = true, // tslint:disable-line
                columnArray: Array<any> = [],
                categoryArray: Array<any> = [],
                actionsArray: Array<any> = [],
                trackerArray: Array<any> = [],
                userArray: Array<any> = []) {
        this.columns = [];
        this.categories = [];
        this.auto_actions = [];
        this.issue_trackers = [];
        this.users = [];

        columnArray.forEach((column: any) => {
            this.columns.push(new Column(+column.id,
                                         column.name,
                                         +column.position,
                                         +column.board_id,
                                         +column.task_limit,
                                         column.ownTask));
        });

        categoryArray.forEach((category: any) => {
            this.categories.push(new Category(+category.id,
                                              category.name,
                                              category.default_task_color,
                                              +category.board_id));
        });

        actionsArray.forEach((action: any) => {
            this.auto_actions.push(new AutoAction(+action.id,
                                                  +action.trigger,
                                                  +action.source_id,
                                                  +action.type,
                                                  action.change_to,
                                                  +action.board_id));
        });

        trackerArray.forEach((tracker: any) => {
            this.issue_trackers.push(new IssueTracker(+tracker.id,
                                                      tracker.url,
                                                      tracker.regex));
        });

        userArray.forEach((user: any) => {
            this.users.push(new User(+user.default_board_id,
                                     user.email,
                                     +user.id,
                                     user.last_login,
                                     +user.security_level,
                                     +user.user_option_id,
                                     user.username,
                                     user.board_access,
                                     user.collapsed));
        });
    }

    addColumn(name: string): void {
        let column = new Column(0, name, this.columns.length);
        this.columns.push(column);
    }

    addCategory(name: string, color: string): void {
        this.categories.push(new Category(0, name, color));
    }

    addIssueTracker(url: string, regex: string): void {
        this.issue_trackers.push(new IssueTracker(0, url, regex));
    }
}

