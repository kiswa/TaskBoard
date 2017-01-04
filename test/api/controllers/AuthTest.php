<?php
use RedBeanPHP\R;
use Firebase\JWT\JWT;

class AuthTest extends PHPUnit_Framework_TestCase {
    private $auth;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        R::nuke();

        $this->auth = new Auth(new ContainerMock());
    }

    public function testHasBoardAccess() {
        $user = R::dispense('user');

        $board = R::dispense('board');
        $board->sharedUserList[] = $user;
        R::store($board);

        $hasAccess = Auth::HasBoardAccess(new ContainerMock(),
            new RequestMock(), 1, 1);
        $this->assertEquals(true, $hasAccess);

        $user->security_level = SecurityLevel::ADMIN;
        R::store($user);

        $hasAccess = Auth::HasBoardAccess(new ContainerMock(),
            new RequestMock(), 1, 1);
        $this->assertEquals(true, $hasAccess);
    }

    public function testCreateInitialAdmin() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $admin = R::load('user', 1);

        $this->assertEquals(1, (int) $admin->id);
        $this->assertEquals('admin', $admin->username);

        // Call again to verify only one is created
        Auth::CreateInitialAdmin(new ContainerMock());
        $this->assertEquals(1, R::count('user'));
    }

    public function testCreateJwtSigningKey() {
        Auth::CreateJwtSigningKey();

        $jwt = R::load('jwt', 1);

        $this->assertEquals(1, (int) $jwt->id);
        $this->assertTrue(strlen($jwt->secret) > 1);

        // Call again to verify only one is created
        Auth::CreateJwtSigningKey();
        $this->assertEquals(1, R::count('jwt'));
    }

    public function testRefreshTokenFailures() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $actual = Auth::RefreshToken($request, new ResponseMock(), null);
        $this->assertEquals(400, $actual->status);

        $actual = Auth::RefreshToken(new RequestMock(),
            new ResponseMock(), null);
        $this->assertEquals(401, $actual->status);
    }

    public function testRefreshToken() {
        Auth::CreateInitialAdmin(new ContainerMock());
        Auth::CreateJwtSigningKey();

        $jwtKey = R::load('jwt', 1);
        $admin = R::load('user', 1);

        $token = JWT::encode(array(
            'exp' => time() + 600,
            'uid' => 1,
            'mul' => 1
            ), $jwtKey->secret);

        $admin->active_token = $token;
        R::store($admin);

        $request = new RequestMock();
        $request->header = [$token];

        $actual = Auth::RefreshToken($request, new ResponseMock(),
            new ContainerMock());
        $this->assertTrue(strlen((string) $actual->getBody()) > 0);

        $admin->active_token = '';
        R::store($admin);

        $actual = Auth::RefreshToken($request, new ResponseMock(),
            new ContainerMock());
        $this->assertEquals(401, $actual->status);
    }

    public function testGetUserId() {
        Auth::CreateJwtSigningKey();
        $jwtKey = R::load('jwt', 1);

        $token = JWT::encode(array(
            'exp' => time() + 600,
            'uid' => 1,
            'mul' => 1
            ), $jwtKey->secret);

        $request = new RequestMock();
        $request->header = [$token];

        $actual = Auth::GetUserId($request);
        $this->assertEquals(1, $actual);

        $request->throwInHeader = true;
        $actual = Auth::GetUserId($request);
        $this->assertEquals(-1, $actual);
    }

    public function testLogin() {
        $data = new stdClass();
        $data->username = 'admin';
        $data->password = 'admin';
        $data->remember = false;

        $request = new RequestMock();
        $request->payload = $data;

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);

        $this->auth = new Auth(new ContainerMock());
        Auth::CreateInitialAdmin(new ContainerMock());
        Auth::CreateJwtSigningKey();

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);

        $this->auth = new Auth(new ContainerMock());
        $request->payload->password = 'asdf';

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);
    }

    public function testLogout() {
        Auth::CreateInitialAdmin(new ContainerMock());
        $data = new stdClass();
        $data->username = 'admin';
        $data->password = 'admin';
        $data->remember = false;

        $request = new RequestMock();
        $request->payload = $data;

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $jwt = $actual->data[0];
        $jwtKey = R::load('jwt', 1);

        $this->auth = new Auth(new ContainerMock());
        $request = new RequestMock();
        $request->header = [$jwt];

        $actual = $this->auth->logout($request, new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);
    }

    public function testLogoutFailures() {
        $actual = $this->auth->logout(new RequestMock(),
            new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);

        $this->auth = new Auth(new ContainerMock());
        $request = new RequestMock();
        $request->hasHeader = false;

        $actual = $this->auth->logout($request, new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);
    }

    public function testAuthenticate() {
        $data = new stdClass();
        $data->username = 'admin';
        $data->password = 'admin';
        $data->remember = false;

        $request = new RequestMock();
        $request->payload = $data;

        Auth::CreateInitialAdmin(new ContainerMock());
        Auth::CreateJwtSigningKey();

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);

        $jwt = $actual->data[0];

        $this->auth = new Auth(new ContainerMock());
        $request = new RequestMock();
        $request->header = [$jwt];

        $actual = $this->auth->authenticate($request, new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);

        $this->auth = new Auth(new ContainerMock());
        $request->hasHeader = false;

        $actual = $this->auth->authenticate($request, new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);

        $this->auth = new Auth(new ContainerMock());
        $request = new RequestMock();
        $request->header = ['not a valid JWT'];

        $actual = $this->auth->authenticate($request, new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);
    }
}

