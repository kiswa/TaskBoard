<?php
require_once __DIR__ . '/../Mocks.php';

class TasksTest extends PHPUnit_Framework_TestCase {
    private $tasks;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->tasks = new Tasks(new ContainerMock());
    }

    public function testGetTask() {
        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->tasks->getTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('No task found for ID 1.',
            $actual->alerts[0]['text']);

        $this->createTask();
        $request->header = [DataMock::getJwt()];

        $actual = $this->tasks->getTask($request, new ResponseMock(), $args);

        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetTaskUnprivileged() {
        $args = [];
        $args['id'] = 1;

        $this->createTask();
        DataMock::createUnpriviligedUser();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->getTask($request, new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveTask() {
        $actual = $this->createTask();

        $this->assertEquals('success', $actual->status);

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->tasks->removeTask($request,
            new ResponseMock(), $args);

        $this->assertEquals('Task test removed.', $actual->alerts[0]['text']);
    }

    public function testAddRemoveTaskUnprivileged() {
        DataMock::createUnpriviligedUser();

        $request= new RequestMock();
        $task = DataMock::getTask();
        $task->id = 0;
        $task->column_id = 0;
        $task->category_id = 0;
        $task->attachments = [];
        $task->comments = [];

        $request->payload = $task;
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->addTask($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $this->tasks = new Tasks(new ContainerMock);

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->removeTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddBadTask() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->tasks->addTask($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testRemoveBadTask() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 5; // No such task

        $response = $this->tasks->removeTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testUpdateTask() {
        $this->createTask();

        $task = DataMock::getTask();
        $task->title = 'updated';

        $args = [];
        $args['id'] = $task->id;

        $request = new RequestMock();
        $request->payload = $task;
        $request->header = [DataMock::getJwt()];

        $response = $this->tasks->updateTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);

        $this->tasks = new Tasks(new ContainerMock());
        $request->payload = new stdClass();
        $request->header = [DataMock::getJwt()];

        $response = $this->tasks->updateTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testUpdateTaskUnprivileged() {
        DataMock::createUnpriviligedUser();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->updateTask($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    private function createTask() {
        $request= new RequestMock();
        $task = DataMock::getTask();
        $task->id = 0;
        $task->column_id = 0;
        $task->category_id = 0;
        $task->attachments = [];
        $task->comments = [];

        $request->payload = $task;
        $request->header = [DataMock::getJwt()];

        $response = $this->tasks->addTask($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $response->status);

        $this->tasks = new Tasks(new ContainerMock);

        return $response;
    }

}

