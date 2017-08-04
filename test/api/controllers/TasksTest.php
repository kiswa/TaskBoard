<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class TasksTest extends PHPUnit_Framework_TestCase {
    private $tasks;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) {
        }
    }

    public function setUp() {
        R::nuke();
        Auth::CreateInitialAdmin(new ContainerMock());

        $this->tasks = new Tasks(new ContainerMock());
    }

    public function testGetTask() {
        $this->createTask();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->tasks->getTask($request, new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetTaskNotFound() {
        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->tasks->getTask($request, new ResponseMock(), $args);
        $this->assertEquals('No task found for ID 1.',
            $actual->alerts[0]['text']);

    }

    public function testGetTaskForbidden() {
        $this->createTask();
        DataMock::CreateBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->getTask($request, new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testGetTaskUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->getTask($request, new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddTask() {
        $this->createTask();
        $data = $this->getTaskData();

        $assignee = R::load('user', 1);
        $data->assignees[] = $assignee;

        $category = R::load('category', 1);
        $category->name = 'Front End';
        R::store($category);
        $data->categories[] = $category;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $data;

        $actual = $this->tasks->addTask($request, new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);
    }

    public function testAddTaskTop() {
        $this->createTask();
        $data = $this->getTaskData();

        $user = R::load('user', 1);
        $opts = R::load('useroption', $user->user_option_id);

        $opts->new_tasks_at_bottom = false;
        R::store($opts);

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $data;

        $actual = $this->tasks->addTask($request, new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);
    }

    public function testAddTaskUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request= new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->addTask($request, new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddTaskInvalid() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->tasks->addTask($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testAddTaskForbidden() {
        $this->createTask();
        DataMock::CreateBoardAdminUser();

        $task = $this->getTaskData();
        $task->id = 0;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];
        $request->payload = $task;

        $actual = $this->tasks->addTask($request, new ResponseMock(), null);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateTask() {
        ini_set("xdebug.var_display_max_children", -1);
        ini_set("xdebug.var_display_max_data", -1);
        ini_set("xdebug.var_display_max_depth", -1);
        $this->createTask();

        $task = $this->getTaskData();
        $task->id = 1;
        $task->title = 'updated';

        $args = [];
        $args['id'] = $task->id;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];
        $request->payload = $task;

        $response = $this->tasks->updateTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);
        $this->assertEquals('updated', $response->data[1][0]['title']);
    }

    public function testUpdateTaskInvalid() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];
        $request->invalidPayload = true;

        $response = $this->tasks->updateTask($request,
            new ResponseMock(), null);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testUpdateTaskUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->updateTask($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateTaskForbidden() {
        $this->createTask();
        DataMock::CreateBoardAdminUser();

        $task = $this->getTaskData();
        $task->id = 1;
        $task->title = 'updated';

        $args = [];
        $args['id'] = $task->id;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];
        $request->payload = $task;

        $actual = $this->tasks->updateTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveTask() {
        $this->createTask();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->tasks->removeTask($request,
            new ResponseMock(), $args);

        $this->assertEquals('Task test removed.', $actual->alerts[0]['text']);
    }

    public function testRemoveTaskUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->tasks->removeTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveTaskInvalid() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 2; // No such task

        $response = $this->tasks->removeTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testRemoveTaskForbidden() {
        $this->createTask();
        DataMock::CreateBoardAdminUser();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $args = [];
        $args['id'] = 1;

        $actual = $this->tasks->removeTask($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    private function getTaskData() {
        $data = new stdClass();

        $data->title = 'task';
        $data->description = 'the words';
        $data->column_id = 1;
        $data->color = '';
        $data->due_date = null;
        $data->points = null;
        $data->position = 0;
        $data->comments = [];
        $data->attachments = [];
        $data->assignees = [];
        $data->categories = [];

        return $data;
    }

    private function createTask() {
        $user = R::load('user', 1);

        $task = R::dispense('task');
        $task->title = 'test';
        $task->sharedUserList[] = $user;

        $column = R::dispense('column');
        $column->xownTaskList[] = $task;

        $board = R::dispense('board');
        $board->xownColumnList[] = $column;
        R::store($board);
    }

}

