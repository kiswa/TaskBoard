<?php
require_once 'Mocks.php';

class UserTest extends PHPUnit_Framework_TestCase {
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

        $user = DataMock::getUser();
        $this->json = json_encode($user);
        $this->bean = $user;
        // Convert to bean format
        $this->bean->xownOptionList = $user->options;
    }

    public function testCreateUser() {
        $user = new User(new ContainerMock());
        $this->assertDefaultProperties($user);
    }

    public function testLoadFromBean() {
        $user = new User(new ContainerMock());

        $user->loadFromBean($this->bean);
        $this->assertMockProperties($user);
    }

    public function testLoadFromJson() {
        $user = new User(new ContainerMock());

        $user->loadFromJson('');
        $this->assertDefaultProperties($user);

        $user->loadFromJson($this->json);
        $this->assertMockProperties($user);
    }

    public function testUpdateBean() {
        $user = new User(new ContainerMock());
        $user->loadFromBean($this->bean);

        $user->updateBean();
        $bean = $user->getBean();

        $this->assertTrue($bean->id === $user->id);
        $this->assertTrue($bean->security_level === $user->security_level);
        $this->assertTrue($bean->username === $user->username);
        $this->assertTrue($bean->salt === $user->salt);
        $this->assertTrue($bean->password_hash === $user->password_hash);
        $this->assertTrue($bean->email === $user->email);
        $this->assertTrue($bean->default_board_id === $user->default_board_id);
    }

    private function assertDefaultProperties($user) {
        $this->assertTrue($user->id === 0);
        $this->assertTrue($user->security_level == SecurityLevel::User);
        $this->assertTrue($user->username === '');
        $this->assertTrue($user->salt === '');
        $this->assertTrue($user->password_hash === '');
        $this->assertTrue($user->email === '');
        $this->assertTrue($user->default_board_id === 0);
    }

    private function assertMockProperties($user) {
        $this->assertTrue($user->id === 1);
        $this->assertTrue($user->security_level->getValue() ===
            SecurityLevel::BoardAdmin);
        $this->assertTrue($user->username === 'tester');
        $this->assertTrue($user->salt === 'salty1234');
        $this->assertTrue($user->password_hash === 'hashpass1234');
        $this->assertTrue($user->email === 'user@example.com');
        $this->assertTrue($user->default_board_id === 1);
    }
}

