import { AutoAction } from './auto-actions.model';
import { Column } from './column.model';
import { Category } from './category.model';
import { IssueTracker } from './issue-tracker.model';
import { User } from './user.model';

export class Board {
    constructor(public id: number = 0,
                public name: string = '',
                public is_active: boolean = true, // tslint:disable-line
                public columns: Array<Column> = [],
                public categories: Array<Category> = [],
                public auto_actions: Array<AutoAction> = [], // tslint:disable-line
                public issue_trackers: Array<IssueTracker> = [], // tslint:disable-line
                public users: Array<User> = []) {
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

