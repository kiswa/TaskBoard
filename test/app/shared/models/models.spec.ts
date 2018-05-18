import {
  Activity,
  ActivitySimple,
  ApiResponse,
  Attachment,
  AutoAction,
  Board,
  Category,
  Column,
  Comment,
  IssueTracker,
  Notification,
  Task,
  UserOptions,
  User
} from '../../../../src/app/shared/models';

describe('Models', () => {

  describe('Activity', () => {
    it('can be constructed', () => {
      let actual = new Activity(1, '', '', '', '', 1, 1);

      expect(actual).toBeTruthy();
    });

    it('has a simple version', () => {
      let actual = new ActivitySimple('', 1);
      expect(actual).toBeTruthy();
    });
  });

  describe('ApiResponse', () => {
    it('can be constructed', () => {
      expect(new ApiResponse()).toBeTruthy();
    });
  });

  describe('Attachment', () => {
    it('can be constructed', () => {
      expect(new Attachment()).toBeTruthy();
    });
  });

  describe('AutoAction', () => {
    it('can be constructed', () => {
      expect(new AutoAction()).toBeTruthy();
    });
  });

  describe('Board', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board();
    });

    it('can be created with values', () => {
      const actual = new Board(1, '', true,
        [{ id: 1, name: '', position: 1, board_id: 1, task_limit: 0, ownTask: [] }],
        [{ id: 1, name: '', default_task_color: '', board_id: 1 }],
        [{ id: 1, trigger: 1, source_id: 1, type: 1, change_to: '', board_id: 1 }],
        [{ id: 1, url: '', regex: '' }],
        [{
          default_board_id: 1, email: '', id: 1, last_login: '',
          security_level: 1, user_option_id: 1, username: '',
          board_access: '', collapsed: true
        }]
      );
      expect(actual.id).toEqual(1);
    });

    it('can add a column', () => {
      expect(board.addColumn).toEqual(jasmine.any(Function));
      board.addColumn('test');

      expect(board.columns.length).toEqual(1);
    });

    it('can add a category', () => {
      expect(board.addCategory).toEqual(jasmine.any(Function));
      board.addCategory('test', 'color');

      expect(board.categories.length).toEqual(1);
    });

    it('can add an issue tracker', () => {
      expect(board.addIssueTracker).toEqual(jasmine.any(Function));
      board.addIssueTracker('test', 'test');

      expect(board.issue_trackers.length).toEqual(1);
    });
  });

  describe('Category', () => {
    it('can be constructed', () => {
      expect(new Category()).toBeTruthy();
    });
  });

  describe('Column', () => {
    it('can check for task limit', () => {
      const column = new Column(
        1, '', 1, 1, 1, [{
          id: 1, title: '', description: '', color: '', due_date: '',
          points: 1, position: 1, column_id: 1, columns: [], attachments: [],
          assignees: [], categories: []
        }]
      );

      expect(column.hasTaskLimit()).toEqual(true);
    });
  });

  describe('Comment', () => {
    it('can be constructed', () => {
      expect(new Comment()).toBeTruthy();
    });
  });

  describe('IssueTracker', () => {
    it('can be constructed', () => {
      expect(new IssueTracker()).toBeTruthy();
    });
  });

  describe('Notification', () => {
    it('can be constructed', () => {
      expect(new Notification()).toBeTruthy();
    });
  });

  describe('Task', () => {
    it('can be constructed with values', () => {
      let task = new Task(
        1, '', '', '', '', 1, 1, 1,
        [{ id: 1, text: '', user_id: 1, task_id: 1, timestamp: '', is_edited: 1 }],
        [{
          id: 1, filename: '', name: '', type: '', user_id: 1,
          timestamp: '', task_id: 1
        }],
        [{
          default_board_id: 1, email: '', id: 1, last_login: 1,
          security_level: 1, user_option_id: 1, username: '',
          board_access: [], collapsed: []
        }],
        [{ id: 1, name: '', default_task_color: '', board_id: 1 }]
      );
      expect(task.id).toEqual(1);
    });
  });

  describe('UserOptions', () => {
    it('can be constructed', () => {
      expect(new UserOptions()).toBeTruthy();
    });
  });

  describe('User', () => {
    it('can check if is admin', () => {
      const user = new User();
      expect(user.isAdmin()).toEqual(false);
    });

    it('can check if is board admin', () => {
      const user = new User();
      expect(user.isBoardAdmin()).toEqual(false);
    });

    it('can check if is any admin', () => {
      const user = new User();
      expect(user.isAnyAdmin()).toEqual(false);
    });
  });

});

