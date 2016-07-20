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

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->users = new Users(new ContainerMock());
    }

    public function testGetAllUsers() {
        $this->createUser();
        $this->users = new Users(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->users->getAllUsers($request,
            new ResponseMock(), null);
        $this->assertEquals(3, count($actual->data));

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->users = new Users(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::getJwt(3)];

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

    public function testGetUser() {
        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('No user found for ID 2.',
            $actual->alerts[0]['text']);

        $this->createUser();
        $this->users = new Users(new ContainerMock());

        $request->header = [DataMock::getJwt()];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->users = new Users(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::getJwt(3)];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testGetUserForbidden() {
        $this->createUser();
        DataMock::createStandardUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(3)];

        $this->users = new Users(new ContainerMock());

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveUser() {
        $expected = new ApiJson();

        $actual = $this->createUser();

        $this->assertEquals('User standard added.',
            $actual->alerts[0]['text']);

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->users->removeUser($request,
            new ResponseMock(), $args);

        $this->assertEquals('User standard removed.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveUserUnpriviliged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->users = new Users(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $args = [];
        $args['id'] = 1;

        $actual = $this->users->addUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $this->users = new Users(new ContainerMock());

        $request->header = [DataMock::getJwt(2)];

        $actual = $this->users->removeUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveBadUser() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->users->addUser($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');

        $args = [];
        $args['id'] = 5; // No such user

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

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

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [DataMock::getJwt()];

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'success');

        $request->header = [DataMock::getJwt()];
        $request->payload = new stdClass();

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->alerts[1]['type'] === 'error');

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(3)];

        $actual = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[2]['text']);
    }

    public function testChangePassword() {
        $this->createUser();

        $tmp = RedBeanPHP\R::load('user', 2);
        $this->assertEquals(2, $tmp->id);

        $tmp->password_hash = password_hash('testpass', PASSWORD_BCRYPT);
        RedBeanPHP\R::store($tmp);

        $user = DataMock::getUser();
        $user->new_password = 'test';
        $user->old_password = 'testpass';

        $args = [];
        $args['id'] = $user->id;

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [DataMock::getJwt()];

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);

        $this->users = new Users(new ContainerMock());
        $user->old_password = 'test1';
        $user->new_password = 'test';

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [DataMock::getJwt()];

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    private function createBoard() {
        $board = DataMock::getBoard();
        $board->users = [];
        $board->users[] = new User(new ContainerMock(), 1);
        $board->auto_actions = [];
        $board->columns = [];
        $board->categories = [];
        $board->auto_actions = [];

        $request = new RequestMock();
        $request->payload = $board;
        $request->header = [DataMock::getJwt()];

        $boards = new Boards(new ContainerMock());
        $boards->addBoard($request, new ResponseMock(), null);
    }

    private function createUser() {
        $this->createBoard();

        $response = DataMock::createStandardUser();
        $this->assertEquals('success', $response->status);

        $board = new Board(new ContainerMock(), 1);
        $board->users[] = new User(new ContainerMock(), 2);
        $board->save();

        return $response;
    }
}

