<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class ActivityTest extends PHPUnit\Framework\TestCase {
  private $activity;

  public static function setUpBeforeClass(): void {
    try {
      R::setup('sqlite:tests.db');
    } catch (Exception $ex) {
    }
  }

  public function setUp(): void {
    R::nuke();
    Auth::CreateInitialAdmin(new LoggerMock());

    $this->activity = new Activity(new LoggerMock());
  }

  public function testGetActivityInvalid() {
    $request = new RequestMock();
    $request->hasHeader = false;

    $args = [];
    $args['type'] = 'task';
    $args['id'] = 1;

    $actual = $this->activity->getActivity($request,
      new ResponseMock(), $args);
    $this->assertEquals('error', $actual->body->data->alerts[0]['type']);
  }

  public function testGetActivityForbidden() {
    $this->setupTaskActivity();

    $args = [];
    $args['type'] = 'task';
    $args['id'] = 1;

    DataMock::CreateBoardAdminUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->activity->getActivity($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.', $actual->body->data->alerts[0]['text']);
  }

  public function testGetActivityForTask() {
    $this->setupTaskActivity();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $args = [];
    $args['type'] = 'task';
    $args['id'] = 1;

    $actual = $this->activity->getActivity($request,
      new ResponseMock(), $args);
    $this->assertEquals('success', $actual->body->data->status);
    $this->assertEquals(3, count($actual->body->data->data[1]));
  }

  private function setupTaskActivity() {
    $task = R::dispense('task');
    $comment = R::dispense('comment');
    $attachment = R::dispense('attachment');
    $task->ownComment[] = $comment;
    $task->ownAttachment[] = $attachment;
    R::store($task);

    $activity = R::dispense('activity');
    $activity->item_type = 'task';
    $activity->item_id = 1;
    $activity->log_text = 'test change';
    $activity->timestamp = time();
    R::store($activity);

    $activity = R::dispense('activity');
    $activity->item_type = 'task';
    $activity->item_id = 1;
    $activity->log_text = 'test change';
    $activity->timestamp = time();
    R::store($activity);

    $activity = R::dispense('activity');
    $activity->item_type = 'task';
    $activity->item_id = 1;
    $activity->log_text = 'test change';
    $activity->timestamp = time() + 10;
    R::store($activity);
  }
}

