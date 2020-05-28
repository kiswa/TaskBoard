import { User } from '../../shared/models';

export class BoardData {
  constructor(public title = '',
              public id = 0,
              public name = '',
              public is_active = true, // tslint:disable-line
              public columns: any[] = [],
              public categories: any[] = [],
              public issue_trackers: any[] = [], // tslint:disable-line
              public users: User[] = [],
              public categoryDefaultColor = '#ffffe0',
              public newColumnName = '',
              public newCategoryName = '',
              public issueTrackerUrl = '',
              public issueTrackerBugId = '') { }

  addColumn(): void {
    if (this.newColumnName === '') {
      return;
    }

    this.columns.push({
      name: this.newColumnName,
      position: this.columns.length
    });
    this.newColumnName = '';
  }

  removeColumn(column: any): void {
    const index = this.columns.indexOf(column);

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
      default_task_color: this.categoryDefaultColor
    });
    this.newCategoryName = '';
  }

  removeCategory(category: any): void {
    const index = this.categories.indexOf(category);

    if (index === -1) {
      return;
    }

    this.categories.splice(index, 1);
  }

  addIssueTracker(): void {
    if (this.issueTrackerUrl === '' || this.issueTrackerBugId === '') {
      return;
    }

    this.issue_trackers.push({
      url: this.issueTrackerUrl,
      regex: this.issueTrackerBugId
    });
    this.issueTrackerUrl = '';
    this.issueTrackerBugId = '';
  }

  removeIssueTracker(tracker: any): void {
    const index = this.issue_trackers.indexOf(tracker);

    if (index === -1) {
      return;
    }

    this.issue_trackers.splice(index, 1);
  }
}

