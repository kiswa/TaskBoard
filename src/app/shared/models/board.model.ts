import { Column } from './column.model';
import { Category } from './category.model';
import { IssueTracker } from './issue-tracker.model';

export class Board {
    constructor(public id: number = 0,
            public name: string = '',
            public is_active: boolean = true,
            public columns = [],
            public categories = [],
            public auto_actions = [],
            public issue_trackers = [],
            public users = []) {
    }

    addColumn(name: string): void {
        let column = new Column();
        column.name = name;
        column.position = this.columns.length;

        this.columns.push(column);
    }

    addCategory(name: string, color: string): void {
        this.categories.push(new Category(0, name, color, 0));
    }

    addIssueTracker(url: string, regex: string): void {
        this.issue_trackers.push(new IssueTracker(0, url, regex));
    }
}

