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

        $this->assertTrue($bean->id === $task->id);
        $this->assertTrue($bean->title === $task->title);
    }

    private function assertDefaultProperties($task) {
        $this->assertTrue($task->id === 0);
        $this->assertTrue($task->title === '');
        $this->assertTrue($task->description === '');
        $this->assertTrue($task->assignee_id === 0);
        $this->assertTrue($task->category_id === 0);
        $this->assertTrue($task->color === '');
        $this->assertTrue($task->due_date === null);
        $this->assertTrue($task->points === null);
        $this->assertTrue($task->position === 0);
    }

    private function assertMockProperties($task) {
        $this->assertTrue($task->id === 1);
        $this->assertTrue($task->title === 'test');
        $this->assertTrue($task->description === 'description');
        $this->assertTrue($task->assignee_id === 1);
        $this->assertTrue($task->category_id === 1);
        $this->assertTrue($task->color === '#ffffff');
        $this->assertTrue($task->due_date === 1234567890);
        $this->assertTrue($task->points === 3);
        $this->assertTrue($task->position === 1);
    }
}

