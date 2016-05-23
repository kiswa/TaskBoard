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

    public function testAuthenticateFailures() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $actual = $this->auth->authenticate($request,
            new ResponseMock(), null);

        $this->assertTrue($actual->status === 'failure');

        $actual = $this->auth->authenticate(new RequestMock(),
            new ResponseMock(), null);

        $expected = new ApiJson();
        $expected->addAlert('error', 'Invalid access token.');

        $this->assertEquals($expected, $actual);
    }

    public function testAuthenticate() {
        Auth::CreateInitialAdmin(new ContainerMock());
        // Called twice to verify coverage of the check for existing admin
        Auth::CreateInitialAdmin(new ContainerMock());
        Auth::CreateJwtKey();

        $jwtKey = R::load('jwt', 1);
        $admin = R::load('user', 1);

        $token = JWT::encode(array(
            'exp' => time() + 600,
            'uid' => 1
            ), $jwtKey->secret);

        $admin->active_token = $token;
        R::store($admin);

        $request = new RequestMock();
        $request->header = [$token];

        $actual = $this->auth->authenticate($request,
            new ResponseMock(), null);
        $this->assertTrue(strlen($actual->data[0]) > 0);

        $this->auth = new Auth(new ContainerMock());

        $admin->active_token = '';
        R::store($admin);

        $actual = $this->auth->authenticate($request,
            new ResponseMock(), null);
        $this->assertTrue($actual->status === 'failure');
    }

    public function testLogin() {
        $data = new stdClass();
        $data->username = 'admin';
        $data->password = 'admin';

        $request = new RequestMock();
        $request->payload = $data;

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $this->assertTrue($actual->status === 'failure');

        $this->auth = new Auth(new ContainerMock());
        Auth::CreateInitialAdmin(new ContainerMock());
        Auth::CreateJwtKey();

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $this->assertTrue($actual->status === 'success');

        $this->auth = new Auth(new ContainerMock());
        $request->payload->password = 'asdf';

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $this->assertTrue($actual->status === 'failure');
    }

    public function testLogout() {
        Auth::CreateInitialAdmin(new ContainerMock());
        $data = new stdClass();
        $data->username = 'admin';
        $data->password = 'admin';

        $request = new RequestMock();
        $request->payload = $data;

        $actual = $this->auth->login($request, new ResponseMock(), null);
        $jwt = $actual->data[0];
        $jwtKey = R::load('jwt', 1);

        $this->auth = new Auth(new ContainerMock());
        $request = new RequestMock();
        $request->header = [$jwt];

        $actual = $this->auth->logout($request, new ResponseMock(), null);
        $this->assertTrue($actual->status === 'success');
    }

    public function testLogoutFailures() {
        $actual = $this->auth->logout(new RequestMock(),
            new ResponseMock(), null);
        $this->assertTrue($actual->status === 'failure');

        $this->auth = new Auth(new ContainerMock());
        $request = new RequestMock();
        $request->hasHeader = false;

        $actual = $this->auth->logout($request, new ResponseMock(), null);
        $this->assertTrue($actual->status === 'failure');
    }
}

