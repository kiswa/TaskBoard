<?php
use RedBeanPHP\R;
use Firebase\JWT\JWT;

class AuthTest extends PHPUnit\Framework\TestCase {
  private $auth;

  public static function setUpBeforeClass(): void {
    try {
      R::setup('sqlite:tests.db');
    } catch (Exception $ex) { }
  }

  public function setUp(): void {
    R::nuke();

    $this->auth = new Auth(new LoggerMock());
  }

  public function testHasBoardAccess() {
    $user = R::dispense('user');

    $board = R::dispense('board');
    $board->sharedUserList[] = $user;
    R::store($board);

    $hasAccess = Auth::HasBoardAccess(new RequestMock(), 1, 1);
    $this->assertEquals(true, $hasAccess);

    $user->security_level = SecurityLevel::ADMIN;
    R::store($user);

    $hasAccess = Auth::HasBoardAccess(new RequestMock(), 1, 1);
    $this->assertEquals(true, $hasAccess);
  }

  public function testCreateInitialAdmin() {
    Auth::CreateInitialAdmin(new LoggerMock());

    $admin = R::load('user', 1);

    $this->assertEquals(1, (int) $admin->id);
    $this->assertEquals('admin', $admin->username);

    // Call again to verify only one is created
    Auth::CreateInitialAdmin(new LoggerMock());
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

  public function testValidateTokenFailures() {
    $request = new RequestMock();
    $request->hasHeader = false;

    $actual = Auth::ValidateToken($request, new ResponseMock(), null);
    $this->assertEquals(400, $actual->status);

    $actual = Auth::ValidateToken(new RequestMock(),
      new ResponseMock(), null);
    $this->assertEquals(401, $actual->status);

    Auth::CreateInitialAdmin(new LoggerMock());
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $user = R::load('user', 1);
    $user->active_token = 'whatever';
    R::store($user);

    $actual = Auth::ValidateToken($request, new ResponseMock(), null);
    $this->assertEquals(401, $actual->status);
  }

  public function testValidateToken() {
    Auth::CreateInitialAdmin(new LoggerMock());
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

    $response = new ResponseMock();
    $request = new RequestMock();
    $request->header = [$token];

    Auth::ValidateToken($request, $response,
      new LoggerMock());
    $this->assertEquals(200, $response->status);
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
    $this->assertEquals('failure', $actual->body->data->status);

    $this->auth = new Auth(new LoggerMock());
    Auth::CreateInitialAdmin(new LoggerMock());
    Auth::CreateJwtSigningKey();

    $actual = $this->auth->login($request, new ResponseMock(), null);
    $this->assertEquals('success', $actual->body->data->status);

    $this->auth = new Auth(new LoggerMock());
    $request->payload->password = 'asdf';

    $actual = $this->auth->login($request, new ResponseMock(), null);
    $this->assertEquals('failure', $actual->body->data->status);
  }

  public function testLogout() {
    Auth::CreateInitialAdmin(new LoggerMock());
    $data = new stdClass();
    $data->username = 'admin';
    $data->password = 'admin';
    $data->remember = false;

    $request = new RequestMock();
    $request->payload = $data;

    $actual = $this->auth->login($request, new ResponseMock(), null);
    $jwt = $actual->body->data->data[0];

    $this->auth = new Auth(new LoggerMock());
    $request = new RequestMock();
    $request->header = [$jwt];

    $actual = $this->auth->logout($request, new ResponseMock(), null);
    $this->assertEquals('success', $actual->body->data->status);
  }

  public function testLogoutFailures() {
    $actual = $this->auth->logout(new RequestMock(),
      new ResponseMock(), null);
    $this->assertEquals('failure', $actual->body->data->status);

    $this->auth = new Auth(new LoggerMock());
    $request = new RequestMock();
    $request->hasHeader = false;

    $actual = $this->auth->logout($request, new ResponseMock(), null);
    $this->assertEquals('failure', $actual->body->data->status);
  }

  public function testAuthenticate() {
    $data = new stdClass();
    $data->username = 'admin';
    $data->password = 'admin';
    $data->remember = false;

    $collapsed = R::dispense('collapsed');
    $collapsed->user_id = 1;
    $collapsed->column_id = 1;
    R::store($collapsed);

    $request = new RequestMock();
    $request->payload = $data;

    Auth::CreateInitialAdmin(new LoggerMock());
    Auth::CreateJwtSigningKey();

    $actual = $this->auth->login($request, new ResponseMock(), null);
    $this->assertEquals('success', $actual->body->data->status);

    $jwt = $actual->body->data->data[0];

    $this->auth = new Auth(new LoggerMock());
    $request = new RequestMock();
    $request->header = [$jwt];

    $actual = $this->auth->authenticate($request, new ResponseMock(), null);
    $this->assertEquals('success', $actual->body->data->status);

    $this->auth = new Auth(new LoggerMock());
    $request->hasHeader = false;

    $actual = $this->auth->authenticate($request, new ResponseMock(), null);
    $this->assertEquals('failure', $actual->body->data->status);

    $this->auth = new Auth(new LoggerMock());
    $request = new RequestMock();
    $request->header = ['not a valid JWT'];

    $actual = $this->auth->authenticate($request, new ResponseMock(), null);
    $this->assertEquals('failure', $actual->body->data->status);
  }

}

