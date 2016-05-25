<?php
require_once __DIR__ . '/../Mocks.php';

class UsersTest extends PHPUnit_Framework_TestCase {
    private $users;
    private $jwt;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->users = new Users(new ContainerMock());
        $this->jwt = DataMock::getJwt();
    }

    // TODO: Test for limited returns by user access
    // A User should only see users on their boards, Admin sees all, etc.
    public function testGetAllUsers() {
        $request = new RequestMock();
        $request->header = [$this->jwt];

        $actual = $this->users->getAllUsers($request,
            new ResponseMock(), null);
        $this->assertEquals(2, count($actual->data));

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->jwt = DataMock::getJwt(2);

        $this->users = new Users(new ContainerMock());
        $request = new RequestMock();
        $request->header = [$this->jwt];

        $actual = $this->users->getAllUsers($request,
            new ResponseMock(), null);
        $this->assertEquals('error', $actual->alerts[0]['type']);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testSecureRoute() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $actual = $this->users->getAllUsers($request,
            new ResponseMock(), null);

        $this->assertEquals('Authorization header missing.',
            $actual->alerts[0]['text']);

        $this->users = new Users(new ContainerMock());
        $actual = $this->users->getAllUsers(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('Invalid API token.', $actual->alerts[0]['text']);

        $request->throwInHeader = true;
        $actual = Auth::GetUserId($request);
        $this->assertEquals(-1, $actual);
    }

    // TODO: Test for limited returns by user access
    // A User should only a user on their boards, Admin sees all, etc.
    public function testGetUser() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No user found for ID 2.');

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [$this->jwt];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('No user found for ID 2.',
            $actual->alerts[0]['text']);

        $this->createUser();

        $this->users = new Users(new ContainerMock());

        $this->jwt = DataMock::getJwt();
        $request->header = [$this->jwt];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->jwt = DataMock::getJwt(3);

        $this->users = new Users(new ContainerMock());
        $request = new RequestMock();
        $request->header = [$this->jwt];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveUser() {
        $expected = new ApiJson();

        $actual = $this->createUser();

        $this->assertEquals('User tester added.',
            $actual->alerts[0]['text']);

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [$this->jwt];

        $actual = $this->users->removeUser($request,
            new ResponseMock(), $args);

        $this->assertEquals('User tester removed.',
            $actual->alerts[1]['text']);
    }

    public function testAddRemoveUserUnpriviliged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->users = new Users(new ContainerMock());
        $this->jwt = DataMock::getJwt(2);

        $request = new RequestMock();
        $request->header = [$this->jwt];

        $args = [];
        $args['id'] = 1;

        $actual = $this->users->addUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $this->users = new Users(new ContainerMock());
        $this->jwt = DataMock::getJwt(2);

        $request->header = [$this->jwt];

        $actual = $this->users->removeUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveBadUser() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [$this->jwt];

        $response = $this->users->addUser($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');

        $args = [];
        $args['id'] = 5; // No such user

        $request = new RequestMock();
        $request->header = [$this->jwt];

        $response = $this->users->removeUser($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    public function testUpdateUser() {
        $this->createUser();

        $user = DataMock::getUser();
        $user->username = 'newname';

        $args = [];
        $args['id'] = $user->id;

        $this->jwt = DataMock::getJwt();

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [$this->jwt];

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'success');

        $this->jwt = DataMock::getJwt();
        $request->header = [$this->jwt];
        $request->payload = new stdClass();

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->alerts[2]['type'] === 'error');

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->jwt = DataMock::getJwt(3);

        $this->users = new Users(new ContainerMock());
        $request = new RequestMock();
        $request->header = [$this->jwt];

        $actual = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    private function createUser() {
        $this->jwt = DataMock::getJwt();
        $user = DataMock::getUser();
        $user->id = 0;

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [$this->jwt];

        $response = $this->users->addUser($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $response->status);

        return $response;
    }
}

