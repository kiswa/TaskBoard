import { BoardData } from '../../../../src/app/settings/board-admin/board-data.model';

describe('BoardData', () => {
  let model: BoardData;

  beforeEach(() => {
    model = new BoardData();
  });

  it('can be constructed', () => {
    expect(model).toBeTruthy();
  });

  it('can add a column to itself', () => {
    model.addColumn();
    expect(model.columns.length).toEqual(0);

    model.newColumnName = 'Test';
    model.addColumn();

    expect(model.columns.length).toEqual(1);
  });

  it('can remove a column from itself', () => {
    model.removeColumn({});
    expect(model.columns.length).toEqual(0);

    const column = { name: 'Test', position: 0 };
    model.columns.push(column);

    model.removeColumn(column);
    expect(model.columns.length).toEqual(0);
  });

  it('can add a category to itself', () => {
    model.addCategory();
    expect(model.categories.length).toEqual(0);

    model.newCategoryName = 'Test';
    model.addCategory();

    expect(model.categories.length).toEqual(1);
  });

  it('can remove a category from itself', () => {
    model.removeCategory({});
    expect(model.categories.length).toEqual(0);

    const category = { name: 'Test', default_task_color: '#ffee00' };
    model.categories.push(category);

    model.removeCategory(category);
    expect(model.categories.length).toEqual(0);
  });

  it('can add an issue tracker to itself', () => {
    model.addIssueTracker();
    expect(model.issue_trackers.length).toEqual(0);

    model.issueTrackerUrl = 'test';
    model.issueTrackerBugId = 'test';
    model.addIssueTracker();

    expect(model.issue_trackers.length).toEqual(1);
  });

  it('can delete an issue tracker from itself', () => {
    model.removeIssueTracker({});
    expect(model.issue_trackers.length).toEqual(0);

    const issueTracker = { url: 'test', regex: '' };
    model.issue_trackers.push(issueTracker);

    model.removeIssueTracker(issueTracker);
    expect(model.issue_trackers.length).toEqual(0);
  });
});
