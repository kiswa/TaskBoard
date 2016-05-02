<?php
require_once 'Mocks.php';

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
        $this->bean = $user;
    }

    public function testCreateUserOptions() {
        $options = new UserOptions(new ContainerMock());
        $this->assertDefaultProperties($options);
    }

    public function testLoadFromBean() {
        $options = new UserOptions(new ContainerMock());

        $options->loadFromBean($this->bean);
        $this->assertMockProperties($options);
    }

    public function testLoadFromJson() {
        $options = new UserOptions(new ContainerMock());

        $options->loadFromJson('');
        $this->assertDefaultProperties($options);

        $options->loadFromJson($this->json);
        $this->assertMockProperties($options);
    }

    public function testUpdateBean() {
        $options = new UserOptions(new ContainerMock());
        $options->loadFromBean($this->bean);

        $options->updateBean();
        $bean = $options->getBean();

        $this->assertTrue($bean->id === $user->id);
        $this->assertTrue($bean->new_tasks_at_bottom === $user->new_tasks_at_bottom);
        $this->assertTrue($bean->show_animations === $user->show_animations);
        $this->assertTrue($bean->show_assignee === $user->show_assignee);
        $this->assertTrue($bean->multiple_tasks_per_row === $user->multiple_tasks_per_row);
    }

    private function assertDefaultProperties($user) {
        $this->assertTrue($user->id === 0);
        $this->assertTrue($user->security_level == SecurityLevel::User);
        $this->assertTrue($user->username === '');
        $this->assertTrue($user->salt === '');
        $this->assertTrue($user->password_hash === '');
    }

    private function assertMockProperties($user) {
        $this->assertTrue($user->id === 1);
        $this->assertTrue($user->salt === 'salty1234');
        $this->assertTrue($user->password_hash === 'hashpass1234');
        $this->assertTrue($user->email === 'user@example.com');
        $this->assertTrue($user->default_board_id === 1);
    }
}

