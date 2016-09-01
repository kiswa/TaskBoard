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

        $this->assertTrue($bean->id === $column->id);
        $this->assertTrue($bean->name === $column->name);
        $this->assertTrue($bean->position === $column->position);
        $this->assertTrue($bean->board_id === $column->board_id);
    }

    /**
     * @group single
     */
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
        $this->assertTrue($column->id === 0);
        $this->assertTrue($column->name === '');
        $this->assertTrue($column->position === 0);
        $this->assertTrue($column->board_id === 0);
    }

    private function assertMockProperties($column) {
        $this->assertTrue($column->id === 1);
        $this->assertTrue($column->name === 'col1');
        $this->assertTrue($column->position === 1);
        $this->assertTrue($column->board_id === 1);
    }
}

