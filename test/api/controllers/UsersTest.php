<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class UsersTest extends PHPUnit_Framework_TestCase {
    private $users;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) {
        }
    }

    public function setUp() {
        R::nuke();
        Auth::CreateInitialAdmin(new ContainerMock());

        $this->users = new Users(new ContainerMock());
    }

    public function testGetAllUsers() {
        $this->createUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $actual = $this->users->getAllUsers($request,
            new ResponseMock(), null);
        $this->assertEquals(2, count($actual->data[1]));

        DataMock::CreateUnprivilegedUser();

        $this->users = new Users(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(3)];

        $actual = $this->users->getAllUsers($request,
            new ResponseMock(), null);
        $this->assertEquals('error', $actual->alerts[0]['type']);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testGetUser() {
        $this->createUser();

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetUserUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testGetUserNotFound() {
        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('No user found for ID 2.',
            $actual->alerts[0]['text']);
    }

    public function testGetUserForbidden() {
        $this->createUser();
        DataMock::CreateStandardUser('nono');

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(3)];

        $this->users = new Users(new ContainerMock());

        $actual = $this->users->getUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testAddUser() {
        $board = R::dispense('board');
        R::store($board);

        $user = $this->getUserData();
        $user->default_board_id = $board->id;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $user;

        $actual = $this->users->addUser($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);
    }

    public function testAddDuplicateUser() {
        $user = $this->getUserData();
        $user->username = 'admin';

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $user;

        $actual = $this->users->addUser($request,
            new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);
    }

    public function testAddUserUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $args = [];
        $args['id'] = 1;

        $actual = $this->users->addUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddBadUser() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::GetJwt()];

        $response = $this->users->addUser($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testUpdateUser() {
        $this->createUser();

        $user = $this->getUserData();
        $user->id = 2;
        $user->username = 'newname';
        $user->default_board_id = 1;
        $user->password = 'test';
        $user->boardAccess = [2];

        $args = [];
        $args['id'] = $user->id;

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [DataMock::GetJwt()];

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);
    }

    public function testUpdateUserPassword() {
        $this->createUser();

        $board = R::dispense('board');
        R::store($board);

        $user = $this->getUserData();
        $user->id = 2;
        $user->new_password = 'updated';
        $user->old_password = 'test';
        $user->default_board_id = 2;
        $user->boardAccess = [];

        $args = [];
        $args['id'] = $user->id;

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [DataMock::GetJwt()];

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);
    }

    public function testUpdateUserBadPassword() {
        $this->createUser();

        $user = $this->getUserData();
        $user->id = 2;
        $user->new_password = 'updated';
        $user->old_password = 'wrong';

        $args = [];
        $args['id'] = $user->id;

        $request = new RequestMock();
        $request->payload = $user;
        $request->header = [DataMock::GetJwt()];

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testUpdateUserInvalid() {
        $this->createUser();

        $user = $this->getUserData();
        $user->id = 2;
        $user->username = 'newname';
        $user->default_board_id = 1;

        $args = [];
        $args['id'] = $user->id;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->invalidPayload = true;

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testUpdateUserUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->users->updateUser($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateUserRestricted() {
        $this->createUser();

        $user = $this->getUserData();
        $user->id = 1;

        $args = [];
        $args['id'] = $user->id;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];
        $request->payload = $user;

        $actual = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $actual->status);
    }

    public function testUpdateUserBadId() {
        $this->createUser();

        $user = $this->getUserData();
        $user->id = 2;
        $user->username = 'newname';
        $user->default_board_id = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $user;

        $args = [];
        $args['id'] = $user->id + 1;

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testUpdateUserNameInUse() {
        $this->createUser();

        $user = $this->getUserData();
        $user->id = 2;
        $user->username = 'admin';

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];
        $request->payload = $user;

        $args = [];
        $args['id'] = $user->id;

        $response = $this->users->updateUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testUpdateUserOptions() {
        $this->createUser();

        $args = [];
        $args['id'] = 2;

        $opts = $this->getUserOptionData();
        $opts->id = 2;
        $opts->new_tasks_at_bottom = false;

        $request = new RequestMock();
        $request->payload = $opts;
        $request->header = [DataMock::GetJwt(2)];

        $response = $this->users->updateUserOptions($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);
    }

    public function testUpdateUserOptionsRestricted() {
        $this->createUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $this->users = new Users(new ContainerMock());
        $response = $this->users->updateUserOptions($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Access restricted.',
            $response->alerts[0]['text']);
    }

    public function testUpdateUserOptionsUnprivileged() {
        DataMock::createUnprivilegedUser();

        $data = $this->getUserOptionData();
        $data->id = 2;

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->payload = $data;
        $request->header = [DataMock::GetJwt(2)];

        $response = $this->users->updateUserOptions($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testUpdateUserOptionsBadId() {
        $this->createUser();

        $data = new stdClass();
        $data->id = 2; // No such user options

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->payload = $data;
        $request->header = [DataMock::GetJwt(2)];

        $response = $this->users->updateUserOptions($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testRemoveUser() {
        $this->createUser();

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $actual = $this->users->removeUser($request,
            new ResponseMock(), $args);

        $this->assertEquals('User tester removed.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveUserUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $args = [];
        $args['id'] = 2;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->users->removeUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveBadUser() {
        $args = [];
        $args['id'] = 2; // No such user

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $response = $this->users->removeUser($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    private function getUserData() {
        $data = new stdClass();

        $data->security_level = SecurityLevel::USER;
        $data->username = 'tester';
        $data->email = '';
        $data->default_board_id = 0;
        $data->user_option_id = 0;
        $data->last_login = 0;
        $data->active_token = '';

        $data->password = 'test';
        $data->password_verify = 'test';

        return $data;
    }

    private function getUserOptionData() {
        $data = new stdClass();

        $data->new_tasks_at_bottom = true;
        $data->show_animations = true;
        $data->show_assignee = true;
        $data->multiple_tasks_per_row = false;

        return $data;
    }

    private function createUser() {
        $opts = R::dispense('useroption');
        R::store($opts);

        $user = R::dispense('user');
        $user->security_level = SecurityLevel::USER;
        $user->username = 'tester';
        $user->password_hash = password_hash('test', PASSWORD_BCRYPT);
        $user->user_option_id = $opts->id;

        $admin = R::load('user', 1);
        $board = R::dispense('board');
        $board->sharedUserList[] = $admin;
        $board->sharedUserList[] = $user;
        R::store($board);
    }

}

