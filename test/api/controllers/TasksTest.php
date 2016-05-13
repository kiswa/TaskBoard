<?php
require_once __DIR__ . '/../Mocks.php';

class TasksTest extends PHPUnit_Framework_TestCase {
    private $tasks;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
            // RedBeanPHP\R::fancyDebug(true);
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        $this->tasks = new Tasks(new ContainerMock());
    }

    public function testGetTask() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No task found for ID 1.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->tasks->getTask(null,
            new ResponseMock(), $args);
        $this->assertEquals($expected, $actual);

        $this->createTask();
        $actual = $this->tasks->getTask(null,
                new ResponseMock(), $args);
        $this->assertTrue($actual->status === 'success');
        $this->assertTrue(count($actual->data) === 1);
    }

    public function testAddRemoveTask() {
        $expected = new ApiJson();

        $actual = $this->createTask();

        $expected->setSuccess();
        $expected->addAlert('success', 'Task test added.');

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'Task test removed.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->tasks->removeTask(null,
            new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

    public function testAddBadTask() {
        $request = new RequestMock();
        $request->invalidPayload = true;

        $response = $this->tasks->addTask($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');
    }

    public function testRemoveBadTask() {
        $args = [];
        $args['id'] = 5; // No such task

        $response = $this->tasks->removeTask(null,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    public function testUpdateTask() {
        $this->createTask();

        $task = DataMock::getTask();
        $task->title = 'updated';

        $args = [];
        $args['id'] = $task->id;

        $request = new RequestMock();
        $request->payload = $task;

        $response = $this->tasks->updateTask($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'success');

        $request->payload = new stdClass();
        $response = $this->tasks->updateTask($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->alerts[2]['type'] === 'error');
    }

    private function createTask() {
        $request= new RequestMock();
        $task = DataMock::getTask();
        $task->id = 0;

        $request->payload = $task;

        $response = $this->tasks->addTask($request,
            new ResponseMock(), null);
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

