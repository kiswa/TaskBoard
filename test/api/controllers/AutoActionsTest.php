<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class AutoActionsTest extends PHPUnit\Framework\TestCase {
  private $actions;

  public static function setUpBeforeClass(): void {
    try {
      R::setup('sqlite:tests.db');
    } catch (Exception $ex) {
    }
  }

  public function setUp(): void {
    R::nuke();
    Auth::CreateInitialAdmin(new ContainerMock());

    $this->actions = new AutoActions(new ContainerMock());
  }

  public function testGetAllActions() {
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->actions->getAllActions($request,
      new ResponseMock(), null);
    $this->assertEquals('No automatic actions in database.',
      $actual->alerts[0]['text']);

    $this->actions = new AutoActions(new ContainerMock());
    $this->createAutoAction();

    $actual = $this->actions->getAllActions($request,
      new ResponseMock(), null);
    $this->assertEquals(1, count($actual->data[1]));
    $this->assertEquals('success', $actual->status);

    DataMock::CreateStandardUser();
    $this->actions = new AutoActions(new ContainerMock());
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->actions->getAllActions($request,
      new ResponseMock(), null);
    $this->assertEquals(0, count($actual->data[1]));
    $this->assertEquals('failure', $actual->status);
  }

  public function testGetAllActionsUnprivileged() {
    DataMock::CreateUnprivilegedUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->actions->getAllActions($request,
      new ResponseMock(), null);
    $this->assertEquals('Insufficient privileges.',
      $actual->alerts[0]['text']);
  }

  public function testAddAction() {
    $board = R::dispense('board');
    R::store($board);

    $data = $this->getDefaultAction();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->payload = $data;

    $actual = $this->actions->addAction($request,
      new ResponseMock(), null);
    $this->assertEquals('success', $actual->alerts[0]['type']);
  }

  public function testAddActionUnprivileged() {
    DataMock::CreateUnprivilegedUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->actions->addAction($request,
      new ResponseMock(), null);
    $this->assertEquals('Insufficient privileges.',
      $actual->alerts[0]['text']);
  }

  public function testAddActionInvalid() {
    $request = new RequestMock();
    $request->invalidPayload = true;
    $request->header = [DataMock::GetJwt()];

    $actual = $this->actions->addAction($request,
      new ResponseMock, null);
    $this->assertEquals('failure', $actual->status);
  }

  public function testAddActionForbidden() {
    $board = R::dispense('board');
    R::store($board);

    DataMock::CreateBoardAdminUser();
    $data = $this->getDefaultAction();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];
    $request->payload = $data;

    $actual = $this->actions->addAction($request,
      new ResponseMock(), null);
    $this->assertEquals('Access restricted.',
      $actual->alerts[0]['text']);
  }

  public function testRemoveAction() {
    $this->createAutoAction();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->actions->removeAction($request,
      new ResponseMock(), $args);
    $this->assertEquals('Automatic action removed.',
      $actual->alerts[0]['text']);
  }

  public function testRemoveActionForbidden() {
    $this->createAutoAction();
    DataMock::CreateBoardAdminUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $args = [];
    $args['id'] = 1;

    $this->actions = new AutoActions(new ContainerMock());

    $actual = $this->actions->removeAction($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->alerts[0]['text']);
  }

  public function testRemoveActionUnprivileged() {
    DataMock::CreateUnprivilegedUser();
    $this->createAutoAction();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->actions->removeAction($request,
      new ResponseMock(), $args);
    $this->assertEquals('Insufficient privileges.',
      $actual->alerts[0]['text']);
  }

  public function testRemovedActionInvalid() {
    $args = [];
    $args['id'] = 2; // No such action

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->actions->removeAction($request,
      new ResponseMock(), $args);
    $this->assertEquals('failure', $actual->status);
  }

  private function getDefaultAction() {
    $data = new stdClass();
    $data->board_id = 1;
    $data->trigger = ActionTrigger::ADDED_TO_CATEGORY;
    $data->source_id = 1;
    $data->type = ActionType::CLEAR_DUE_DATE;
    $data->change_to = 'null';

    return $data;
  }

  private function createAutoAction() {
    $auto_action = R::dispense('autoaction');
    $auto_action->trigger = ActionTrigger::ADDED_TO_CATEGORY;
    $auto_action->source_id = 1;
    $auto_action->type = ActionType::CLEAR_DUE_DATE;
    $auto_action->change_to = 'null';

    $board = R::dispense('board');
    $board->xownAutoActionList[] = $auto_action;
    R::store($board);
  }
}

