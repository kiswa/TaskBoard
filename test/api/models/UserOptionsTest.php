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

        $this->assertTrue($bean->id === $options->id);
        $this->assertTrue((bool) $bean->new_tasks_at_bottom ===
            $options->new_tasks_at_bottom);
        $this->assertTrue((bool) $bean->show_animations === $options->show_animations);
        $this->assertTrue((bool) $bean->show_assignee === $options->show_assignee);
        $this->assertTrue((bool) $bean->multiple_tasks_per_row ===
            $options->multiple_tasks_per_row);
    }

    private function assertDefaultProperties($options) {
        $this->assertTrue($options->id === 0);
        $this->assertTrue($options->new_tasks_at_bottom === true);
        $this->assertTrue($options->show_animations === true);
        $this->assertTrue($options->show_assignee === true);
        $this->assertTrue($options->multiple_tasks_per_row === false);
    }

    private function assertMockProperties($options) {
        $this->assertTrue($options->id === 1);
        $this->assertTrue($options->new_tasks_at_bottom === false);
        $this->assertTrue($options->show_animations === false);
        $this->assertTrue($options->show_assignee === false);
        $this->assertTrue($options->multiple_tasks_per_row === true);
    }
}

