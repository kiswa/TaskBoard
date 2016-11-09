import { User } from '../../shared/index';

export class BoardData {
    constructor(public title = '',
        public id = 0,
        public boardName = '',
        public columns: Array<any> = [],
        public categories: Array<any> = [],
        public issueTrackers: Array<any> = [],
        public users: Array<User> = [],
        public categoryDefaultColor = '#ffffe0',
        public newColumnName = '',
        public newCategoryName = '',
        public issueTrackerUrl = '',
        public issueTrackerBugId = '') { }

    addColumn(): void {
        if (this.newColumnName === '') {
            return;
        }

        this.columns.push({ name: this.newColumnName, tasks: [] });
        this.newColumnName = '';
    }

    removeColumn(column: any): void {
        let index = this.columns.indexOf(column);

        if (index === -1) {
            return;
        }

        this.columns.splice(index, 1);
    }

    addCategory(): void {
        if (this.newCategoryName === '') {
            return;
        }

        this.categories.push({
            name: this.newCategoryName,
            defaultColor: this.categoryDefaultColor
        });
        this.newCategoryName = '';
    }

    removeCategory(category: any): void {
        let index = this.categories.indexOf(category);

        if (index === -1) {
            return;
        }

        this.categories.splice(index, 1);
    }

    addIssueTracker(): void {
        if (this.issueTrackerUrl === '' || this.issueTrackerBugId === '') {
            return;
        }

        this.issueTrackers.push({
            url: this.issueTrackerUrl,
            regex: this.issueTrackerBugId
        });
        this.issueTrackerUrl = '';
        this.issueTrackerBugId = '';
    }

    removeIssueTracker(tracker: any): void {
        let index = this.issueTrackers.indexOf(tracker);

        if (index === -1) {
            return;
        }

        this.issueTrackers.splice(index, 1);
    }
}

