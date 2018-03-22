import { TestBed } from '@angular/core/testing'
import { Location } from '@angular/common';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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

  find () {
    return {};
  }

  destroy () {}

  setOptions (name, opts) {
    this.opts = opts;
  }
}

export class BoardServiceMock {
  public activeBoardChanged = new BehaviorSubject({ id: 0, name: 'Test', columns: [] });

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

