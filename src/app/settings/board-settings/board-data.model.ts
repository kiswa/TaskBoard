export class BoardData {
    constructor(public title = '',
        public boardName = '',
        public columns = [],
        public categories = [],
        public issueTrackers = [],
        public users = [],
        public categoryDefaultColor = '#ffffe0',
        public newColumnName = '',
        public newCategoryName = '',
        public issueTrackerUrl = '',
        public issueTrackerBugId = '') { }

    addColumn(): void {
        if (this.newColumnName === '') {
            return;
        }

        this.columns.push({ name: this.newColumnName });
        this.newColumnName = '';
    }

    removeColumn(column): void {
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

    removeCategory(category): void {
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
            bugId: this.issueTrackerBugId
        });
        this.issueTrackerUrl = '';
        this.issueTrackerBugId = '';
    }

    removeIssueTracker(tracker): void {
        let index = this.issueTrackers.indexOf(tracker);

        if (index === -1) {
            return;
        }

        this.issueTrackers.splice(index, 1);
    }
}

