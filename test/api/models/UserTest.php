<?php
require_once __DIR__ . '/../Mocks.php';

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
    }

    public function testCreateUser() {
        $user = new User(new ContainerMock());
        $this->assertDefaultProperties($user);
    }

    public function testLoadFromBean() {
        $user = new User(new ContainerMock());

        $user->loadFromBean(null);
        $this->assertDefaultProperties($user);

        $user->loadFromBean($this->bean);
        $this->assertMockProperties($user);
    }

    public function testLoadFromJson() {
        $user = new User(new ContainerMock());

        $user->loadFromJson('');
        $this->assertDefaultProperties($user);

        $user->loadFromJson('{"id":0}');
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
        $this->assertTrue($bean->security_level ===
            $user->security_level->getValue());
        $this->assertTrue($bean->username === $user->username);
        $this->assertTrue($bean->password_hash === $user->password_hash);
        $this->assertTrue($bean->email === $user->email);
        $this->assertTrue($bean->default_board_id === $user->default_board_id);
        $this->assertTrue($bean->last_login === $user->last_login);
    }

    private function assertDefaultProperties($user) {
        $this->assertTrue($user->id === 0);
        $this->assertTrue($user->security_level->getValue() ===
            SecurityLevel::Unprivileged);
        $this->assertTrue($user->username === '');
        $this->assertTrue($user->password_hash === '');
        $this->assertTrue($user->email === '');
        $this->assertTrue($user->default_board_id === 0);
        $this->assertTrue($user->last_login === 0);
    }

    private function assertMockProperties($user) {
        $this->assertTrue($user->id === 2);
        $this->assertTrue($user->security_level->getValue() ===
            SecurityLevel::BoardAdmin);
        $this->assertTrue($user->username === 'tester');
        $this->assertTrue($user->password_hash === 'hashpass1234');
        $this->assertTrue($user->email === 'user@example.com');
        $this->assertTrue($user->default_board_id === 1);
        $this->assertTrue($user->last_login === 123456789);
    }
}

