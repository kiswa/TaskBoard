<?php
require_once __DIR__ . '/../Mocks.php';

class UsersTest extends PHPUnit_Framework_TestCase {
    private $users;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        $this->users = new Users(new ContainerMock());
    }

    public function testGetAllUsers() {
        $expected = new ApiJson();
        $expected->addAlert('info', 'No users in database.');

        $actual = $this->users->getAllUsers(null, new ResponseMock(), null);
        $this->assertEquals($expected, $actual);

        $this->createUser();

        $users = $this->users->getAllUsers(null, new ResponseMock(), null);
        $this->assertTrue(count($users->data) === 1);
        $this->assertTrue($users->status === 'success');
    }

    public function testGetUser() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No user found for ID 1.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->users->getUser(null, new ResponseMock(), $args);
        $this->assertEquals($expected, $actual);

        $this->createUser();
        $actual = $this->users->getUser(null, new ResponseMock(), $args);
        $this->assertTrue($actual->status === 'success');
        $this->assertTrue(count($actual->data) === 1);
    }

    public function testAddRemoveUser() {
        $expected = new ApiJson();

        $actual = $this->createUser();

        $expected->setSuccess();
        $expected->addAlert('success', 'User tester added.');

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'User tester removed.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->users->removeUser(null, new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

    public function testAddBadUser() {
        $request = new RequestMock();
        $request->invalidPayload = true;

        $response = $this->users->addUser($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');
    }

    public function testRemoveBadUser() {
        $args = [];
        $args['id'] = 5; // No such user

        $response = $this->users->removeUser(null, new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    public function testUpdateUser() {
        $this->createUser();

        $user = DataMock::getUser();
        $user->username = 'newname';

        $args = [];
        $args['id'] = $user->id;

        $request = new RequestMock();
        $request->payload = $user;

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'success');

        $request->payload = new stdClass();
        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->alerts[2]['type'] === 'error');
    }

    private function createUser() {
        $request = new RequestMock();
        $user = DataMock::getUser();
        $user->id = 0;

        $request->payload = $user;

        $response = $this->users->addUser($request,
            new ResponseMock(), null);
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

