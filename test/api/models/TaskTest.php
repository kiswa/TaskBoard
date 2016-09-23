<?php
require_once __DIR__ . '/../Mocks.php';

class TaskTest extends PHPUnit_Framework_TestCase {
    private $json = '';
    private $bean;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    protected function setUp() {
        RedBeanPHP\R::nuke();

        if ($this->json !== '') {
            return;
        }

        $task = DataMock::getTask();
        $this->json = json_encode($task);
        $this->bean = $task;
        // Convert to bean format
        $this->bean->xownAttachmentList = $task->attachments;
        $this->bean->xownCommentList = $task->comments;
    }

    public function testCreateTask() {
        $task = new Task(new ContainerMock());
        $this->assertDefaultProperties($task);
    }

    public function testLoadFromBean() {
        $task = new Task(new ContainerMock());

        $task->loadFromBean(null);
        $this->assertDefaultProperties($task);

        $task->loadFromBean($this->bean);
        $this->assertMockProperties($task);
    }

    public function testLoadFromJson() {
        $task = new Task(new ContainerMock());

        $task->loadFromJson('');
        $this->assertDefaultProperties($task);

        $task->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($task);

        $task->loadFromJson($this->json);
        $this->assertMockProperties($task);
    }

    public function testUpdateBean() {
        $task = new Task(new ContainerMock());
        $task->loadFromBean($this->bean);

        $task->updateBean();
        $bean = $task->getBean();

        $this->assertEquals($bean->title, $task->title);
        $this->assertEquals($bean->column_id, $task->column_id);
    }

    private function assertDefaultProperties($task) {
        $this->assertEquals(0, $task->id);
        $this->assertEquals('', $task->title);
        $this->assertEquals('', $task->description);
        $this->assertEquals(0, $task->assignee);
        $this->assertEquals(0, $task->category_id);
        $this->assertEquals(0, $task->column_id);
        $this->assertEquals('', $task->color);
        $this->assertEquals(null, $task->due_date);
        $this->assertEquals(null, $task->points);
        $this->assertEquals(0, $task->position);
    }

    private function assertMockProperties($task) {
        $this->assertEquals(1, $task->id);
        $this->assertEquals('test', $task->title);
        $this->assertEquals('description', $task->description);
        $this->assertEquals(1, $task->assignee);
        $this->assertEquals(1, $task->category_id);
        $this->assertEquals(1, $task->column_id);
        $this->assertEquals('#ffffff', $task->color);
        $this->assertEquals(1234567890, $task->due_date);
        $this->assertEquals(3, $task->points);
        $this->assertEquals(1, $task->position);
    }
}

