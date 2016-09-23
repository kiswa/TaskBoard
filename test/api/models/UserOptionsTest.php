<?php
require_once __DIR__ . '/../Mocks.php';

class UserOptionsTest extends PHPUnit_Framework_TestCase {
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

        $options = DataMock::getUserOptions();
        $this->json = json_encode($options);
        $this->bean = $options;
    }

    public function testCreateUserOptions() {
        $options = new UserOptions(new ContainerMock());
        $this->assertDefaultProperties($options);
    }

    public function testLoadFromBean() {
        $options = new UserOptions(new ContainerMock());

        $options->loadFromBean(null);
        $this->assertDefaultProperties($options);

        $options->loadFromBean($this->bean);
        $this->assertMockProperties($options);
    }

    public function testLoadFromJson() {
        $options = new UserOptions(new ContainerMock());

        $options->loadFromJson('');
        $this->assertDefaultProperties($options);

        $options->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($options);

        $options->loadFromJson($this->json);
        $this->assertMockProperties($options);
    }

    public function testUpdateBean() {
        $options = new UserOptions(new ContainerMock());
        $options->loadFromBean($this->bean);

        $options->updateBean();
        $bean = $options->getBean();

        $this->assertEquals($options->new_tasks_at_bottom,
            (bool) $bean->new_tasks_at_bottom);
        $this->assertEquals($options->show_animations,
            (bool) $bean->show_animations);
        $this->assertEquals($options->show_assignee,
            (bool) $bean->show_assignee);
        $this->assertEquals($options->multiple_tasks_per_row,
            (bool) $bean->multiple_tasks_per_row);
    }

    private function assertDefaultProperties($options) {
        $this->assertEquals(0, $options->id);
        $this->assertEquals(true, $options->new_tasks_at_bottom);
        $this->assertEquals(true, $options->show_animations);
        $this->assertEquals(true, $options->show_assignee);
        $this->assertEquals(false, $options->multiple_tasks_per_row);
    }

    private function assertMockProperties($options) {
        $this->assertEquals(1, $options->id);
        $this->assertEquals(false, $options->new_tasks_at_bottom);
        $this->assertEquals(false, $options->show_animations);
        $this->assertEquals(false, $options->show_assignee);
        $this->assertEquals(true, $options->multiple_tasks_per_row);
    }
}

