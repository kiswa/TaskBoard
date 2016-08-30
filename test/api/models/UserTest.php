<?php
require_once __DIR__ . '/../Mocks.php';

/**
 * @group single
 */
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

        $this->assertEquals($bean->id, $user->id);
        $this->assertEquals($bean->security_level,
            $user->security_level->getValue());
        $this->assertEquals($bean->username, $user->username);
        $this->assertEquals($bean->password_hash, $user->password_hash);
        $this->assertEquals($bean->email, $user->email);
        $this->assertEquals($bean->default_board_id, $user->default_board_id);
        $this->assertEquals($bean->user_option_id, $user->user_option_id);
        $this->assertEquals($bean->last_login, $user->last_login);
    }

    private function assertDefaultProperties($user) {
        $this->assertEquals(0, $user->id);
        $this->assertEquals(SecurityLevel::Unprivileged,
            $user->security_level->getValue());
        $this->assertEquals('', $user->username);
        $this->assertEquals('', $user->password_hash);
        $this->assertEquals('', $user->email);
        $this->assertEquals(0, $user->default_board_id);
        $this->assertEquals(0, $user->user_option_id);
        $this->assertEquals(0, $user->last_login);
    }

    private function assertMockProperties($user) {
        $this->assertEquals(2, $user->id);
        $this->assertEquals(SecurityLevel::BoardAdmin,
            $user->security_level->getValue());
        $this->assertEquals('tester', $user->username);
        $this->assertEquals('hashpass1234', $user->password_hash);
        $this->assertEquals('user@example.com', $user->email);
        $this->assertEquals(0, $user->default_board_id);
        $this->assertEquals(0, $user->user_option_id);
        $this->assertEquals(123456789, $user->last_login);
    }
}

