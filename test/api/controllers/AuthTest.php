<?php

class AuthTest extends PHPUnit_Framework_TestCase {
    private $auth;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        $this->auth = new Auth(new ContainerMock());
    }

    /**
     * @group single
     */
    public function testAuthenticate() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $actual = $this->auth->authenticate($request,
            new ResponseMock(), null);

        $this->assertTrue($actual === 400);
    }
}

