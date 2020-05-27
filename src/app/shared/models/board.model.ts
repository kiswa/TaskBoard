import { AutoAction } from './auto-actions.model';
import { Column } from './column.model';
import { Category } from './category.model';
import { IssueTracker } from './issue-tracker.model';
import { User } from './user.model';

export class Board {
  public columns: Column[];
  public categories: Category[];
  public auto_actions: AutoAction[]; // tslint:disable-line
  public issue_trackers: IssueTracker[]; // tslint:disable-line
  public users: User[];

  constructor(public id: number = 0,
              public name: string = '',
              public is_active: boolean = true, // tslint:disable-line
              columnArray: any[] = [],
              categoryArray: any[] = [],
              actionsArray: any[] = [],
              trackerArray: any[] = [],
              userArray: any[] = []) {
    this.columns = [];
    this.categories = [];
    this.auto_actions = [];
    this.issue_trackers = [];
    this.users = [];

    columnArray.forEach((column: any) => {
      this.columns.push(this.convertColumn(column));
    });

    this.columns.sort((a, b) => a.position - b.position);

    categoryArray.forEach((category: any) => {
      this.categories.push(this.convertCategory(category));
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
    const column = new Column(0, name, this.columns.length);
    this.columns.push(column);
  }

  addCategory(name: string, color: string): void {
    this.categories.push(new Category(0, name, color));
  }

  addIssueTracker(url: string, regex: string): void {
    this.issue_trackers.push(new IssueTracker(0, url, regex));
  }

  private convertColumn(column: any): Column {
    const col = new Column(+column.id, column.name, +column.position,
                           +column.board_id, +column.task_limit,
                           column.ownTask);

    return col;
  }

  private convertCategory(category: any): Category {

    const cat = new Category(+category.id, category.name,
                             category.default_task_color, +category.board_id);

    return cat;
  }
}

