import { TestBed } from '@angular/core/testing'
import { Location } from '@angular/common';

import { BehaviorSubject } from 'rxjs';

import { User, Board } from '../../src/app/shared/models';

export class RouterMock {
  public url = {
    indexOf: str => TestBed.get(Location).path().indexOf(str)
  }

  navigate(arr) {
    TestBed.get(Location).go(arr[0]);
  }
}

export class DragulaMock {
  public opts;
  public dropModel = new BehaviorSubject([
    {},
    { id: '1' },
    { parentNode: { id: '1' } },
    { parentNode: { id: '1' } }
  ]);
  public dragend = {
    subscribe: (fn) => { fn(); }
  };

  find () {
    return { drake: {
      containers: []
    } };
  }

  destroy () {}

  setOptions (name, opts) {
    this.opts = opts;
  }
}

export class BoardServiceMock {
  public activeBoardChanged =
    new BehaviorSubject({ id: 0, name: 'Test', columns: [] });

  getBoards () {
    return new BehaviorSubject({
      data: [{}, [{ id: 1, name: 'Test', is_active: '1' }]]
    });
  }

  updateActiveBoard (board) {
    this.activeBoardChanged.next(board);
  }

  updateColumn (col) {
    return new BehaviorSubject({});
  }
}

export class SettingsServiceMock {
  public usersChanged = new BehaviorSubject([{ security_level: 2 }]);

  public boardsChanged = new BehaviorSubject([
    { columns: [{ position: 3 }, { position: 2 }] }
  ]);

  updateBoards () { }

  updateActions () { }

  updateUsers () { }

  getUsers () {
    return new BehaviorSubject({ data: [{}, [new User()]] });
  }

  getBoards () {
    return new BehaviorSubject({ data: [{}, [new Board()]] });
  }

  getActions () {
    return new BehaviorSubject({ data: [{}, []] });
  }
}

export class AuthServiceMock {
  public userChanged = new BehaviorSubject({ security_level: 1, id: 1 });

  public userOptions = {
    new_tasks_at_bottom: false,
    multiple_tasks_per_row: false,
    show_animations: false,
    show_assignee: false,
    language: 'en'
  };

  authenticate () { return new BehaviorSubject(true); }
  updateUser () { }
}

export class NotificationsServiceMock {
  public noteAdded = new BehaviorSubject({});

  addNote (note) {
    this.noteAdded.next(note);
  }
}

