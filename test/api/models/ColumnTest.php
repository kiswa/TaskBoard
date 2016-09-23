<?php
require_once __DIR__ . '/../Mocks.php';

class ColumnTest extends PHPUnit_Framework_TestCase {
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

        $column = DataMock::getColumn();
        $this->json = json_encode($column);
        $this->bean = $column;
        // Convert to bean format
        $this->bean->xownTaskList = $column->tasks;
    }

    public function testCreateColumn() {
        $column = new Column(new ContainerMock());
        $this->assertDefaultProperties($column);
    }

    public function testLoadFromBean() {
        $column = new Column(new ContainerMock());

        $column->loadFromBean(null);
        $this->assertDefaultProperties($column);

        $column->loadFromBean($this->bean);
        $this->assertMockProperties($column);
    }

    public function testLoadFromJson() {
        $column = new Column(new ContainerMock());

        $column->loadFromJson('');
        $this->assertDefaultProperties($column);

        $column->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($column);

        $column->loadFromJson($this->json);
        $this->assertMockProperties($column);
    }

    public function testUpdateBean() {
        $column = new Column(new ContainerMock());
        $column->loadFromBean($this->bean);

        $column->updateBean();
        $bean = $column->getBean();

        $this->assertEquals($bean->name, $column->name);
        $this->assertEquals($bean->position, $column->position);
        $this->assertEquals($bean->board_id, $column->board_id);
    }

    public function testRemoveChild() {
        $column = new Column(new ContainerMock());

        $task = new Task(new ContainerMock());
        $task->title = 'test';
        $column->tasks[] = $task;

        $task = new Task(new ContainerMock());
        $task->title = 'test2';
        $column->tasks[] = $task;

        $column->save();
        $this->assertEquals(2, count($column->getBean()->xownTaskList));

        unset($column->tasks[1]);
        $column->save();
        $this->assertEquals(1, count($column->getBean()->xownTaskList));
    }

    private function assertDefaultProperties($column) {
        $this->assertEquals(0, $column->id);
        $this->assertEquals('', $column->name);
        $this->assertEquals(0, $column->position);
        $this->assertEquals(0, $column->board_id);
    }

    private function assertMockProperties($column) {
        $this->assertEquals(1, $column->id);
        $this->assertEquals('col1', $column->name);
        $this->assertEquals(1, $column->position);
        $this->assertEquals(1, $column->board_id);
    }
}

