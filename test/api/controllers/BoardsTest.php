<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class BoardsTest extends PHPUnit\Framework\TestCase {
  private $boards;

  public static function setUpBeforeClass(): void {
    try {
      R::setup('sqlite:tests.db');
    } catch (Exception $ex) {
    }
  }

  public function setUp(): void {
    R::nuke();
    Auth::CreateInitialAdmin(new LoggerMock());

    $this->boards = new Boards(new LoggerMock());
  }

  public function testGetAllBoards() {
    $this->createBoard();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $boards = $this->boards->getAllBoards($request,
      new ResponseMock, null);
    $this->assertEquals(2, count($boards->body->data->data));
    $this->assertEquals('success', $boards->body->data->status);
  }

  public function testGetAllBoardsNotFound() {
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->boards->getAllBoards($request,
      new ResponseMock(), null);
    $this->assertEquals('No boards in database.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testGetAllBoardsUnprivileged() {
    DataMock::CreateUnprivilegedUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->boards->getAllBoards($request,
      new ResponseMock(), null);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testGetBoard() {
    $this->createBoard();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->boards->getBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('success', $actual->body->data->status);
    $this->assertEquals(2, count($actual->body->data->data));
  }

  public function testGetBoardUnprivileged() {
    DataMock::CreateUnprivilegedUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->boards->getBoard($request,
      new ResponseMock(), null);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testGetBoardNotFound() {
    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->boards->getBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('No board found for ID 1.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testGetBoardForbidden() {
    $this->createBoard();
    DataMock::CreateBoardAdminUser();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->boards->getBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testAddBoard() {
    $data = $this->getBoardData();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->payload = $data;

    $actual = $this->boards->addBoard($request,
      new ResponseMock(), null);

    $this->assertEquals('Board added (test).',
      $actual->body->data->alerts[0]['text']);
  }

  public function testAddBoardUnprivileged() {
    DataMock::CreateUnprivilegedUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->boards->addBoard($request,
      new ResponseMock(), null);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testAddBoardInvalid() {
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->invalidPayload = true;

    $response = $this->boards->addBoard($request,
      new ResponseMock(), null);

    $this->assertEquals('failure', $response->body->data->status);
    $this->assertEquals('error', $response->body->data->alerts[0]['type']);
  }

  public function testUpdateBoard() {
    $board = $this->getBoardUpdateData();

    $args = [];
    $args['id'] = $board->id;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->payload = $board;

    $response = $this->boards->updateBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('success', $response->body->data->status);
  }

  public function testUpdateBoardUnprivileged() {
    DataMock::CreateUnprivilegedUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->boards->updateBoard($request,
      new ResponseMock(), null);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testUpdateBoardInvalid() {
    $this->createBoard();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->invalidPayload = true;

    $response = $this->boards->updateBoard($request,
      new ResponseMock(), null);
    $this->assertEquals('error', $response->body->data->alerts[0]['type']);
  }

  public function testUpdateBoardColumn() {
    $board = $this->getBoardUpdateData();
    $board->columns[0]->name = 'changed';

    $args = [];
    $args['id'] = $board->id;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->payload = $board;

    $response = $this->boards->updateBoard($request,
      new ResponseMock(), $args);

    $cols = $response->body->data->data[1][0]['ownColumn'];
    $this->assertEquals('success', $response->body->data->status);
    $this->assertEquals('changed', $cols[0]['name']);
  }

  public function testUpdateBoardNotFound() {
    $this->createBoard();

    $board = $this->getBoardData();
    $board->id = 3;
    unset($board->columns[0]->board_id);
    unset($board->categories[0]->board_id);
    unset($board->issue_trackers[0]->board_id);

    $args = [];
    $args['id'] = $board->id;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->payload = $board;

    $response = $this->boards->updateBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('error', $response->body->data->alerts[0]['type']);
  }

  public function testUpdateBoardForbidden() {
    DataMock::CreateBoardAdminUser();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->boards->updateBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveBoard() {
    $this->createBoard();

    $args = [];
    $args['id'] = 1;

    $action = R::dispense('autoaction');
    $action->board_id = 1;
    R::store($action);

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->boards->removeBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('Board removed (test).',
      $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveBoardUnprivileged() {
    DataMock::CreateUnprivilegedUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->boards->removeBoard($request,
      new ResponseMock(), null);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveBoardInvalid() {
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $args = [];
    $args['id'] = 1; // No such board

    $this->boards = new Boards(new LoggerMock());

    $response = $this->boards->removeBoard($request,
      new ResponseMock(), $args);
    $this->assertEquals('failure', $response->body->data->status);
  }

  private function getBoardUpdateData() {
    $this->createBoard();
    $existing = R::load('board', 1);

    $column = R::dispense('column');
    $column->name = 'one';
    $column->position = 1;
    $existing->xownColumnList[] = $column;
    $column = R::dispense('column');
    $column->name = 'two';
    $column->position = 2;
    $existing->xownColumnList[] = $column;
    $category = R::dispense('category');
    $existing->xownCategoryList[] = $category;
    R::store($existing);

    $user = R::dispense('user');
    $user->username = 'test';
    R::store($user);

    $board = $this->getBoardData();
    $board->id = 1;

    $newColumn = new stdClass();
    $newColumn->name = 'col1';
    $newColumn->position = 0;

    $board->columns[] = $newColumn;
    $board->users[] = $user->export();

    $board->issue_trackers[0]->board_id = 1;
    $board->categories = [];

    return $board;
  }

  private function getBoardData() {
    $board = new stdClass();
    $tracker = new stdClass();
    $category = new stdClass();
    $column = new stdClass();

    $column->name = 'col2';
    $column->position = 1;
    $column->id = 1;
    $column->board_id = 1;

    $category->name = 'cat 1';
    $category->default_task_color = '';
    $category->board_id = 1;

    $tracker->url = 'testing';
    $tracker->regex = '';
    $tracker->board_id = 1;

    $board->name = 'test';
    $board->is_active = true;
    $board->sharedUserList[] = R::load('user', 1);

    $board->issue_trackers[] = $tracker;
    $board->categories[] = $category;
    $board->columns[] = $column;
    $board->users = [];

    return $board;
  }

  private function createBoard() {
    $board = R::dispense('board');
    $column = R::dispense('column');
    $task = R::dispense('task');

    $task->sharedUserList[] = R::load('user', 1);

    $column->name = 'test';
    $column->position = 0;
    $column->xownTaskList[] = $task;

    $board->name = 'test';
    $board->is_active = true;
    $board->sharedUserList[] = R::load('user', 1);
    $board->xownColumnList[] = $column;

    R::store($board);
  }
}

