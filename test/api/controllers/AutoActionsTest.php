<?php
require_once __DIR__ . '/../Mocks.php';

class AutoActionsTest extends PHPUnit_Framework_TestCase {
    private $actions;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->actions = new AutoActions(new ContainerMock());
    }

    public function testGetAllActions() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->actions->getAllActions($request,
            new ResponseMock(), null);
        $this->assertEquals('No automatic actions in database.',
            $actual->alerts[0]['text']);

        $this->createAutoAction();
        $this->actions = new AutoActions(new ContainerMock());

        $request->header = [DataMock::getJwt()];

        $actions = $this->actions->getAllActions($request,
            new ResponseMock(), null);

        $this->assertEquals(2, count($actions->data));
        $this->assertEquals('success', $actions->status);
    }

    public function testAddRemoveAction() {
        $actual = $this->createAutoAction();
        $this->assertEquals('success', $actual->status);

        $args = [];
        $args['id'] = '1';

        $this->actions = new AutoActions(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->actions->removeAction($request,
            new ResponseMock(), $args);

        $this->assertEquals('Automatic action removed.',
            $actual->alerts[0]['text']);
    }

    public function testGetAllActionsUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->actions->getAllActions($request,
            new ResponseMock(), null);

        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveActionUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $action = DataMock::getAutoAction();
        $action->id = 0;

        $request->payload = $action;

        $actual = $this->actions->addAction($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $args = [];
        $args['id'] = '1';

        $this->actions = new AutoActions(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->actions->removeAction($request,
            new ResponseMock(), $args);

        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveBadAction() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->actions->addAction($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);

        $args = [];
        $args['id'] = 5; // No such action

        $request->header = [DataMock::getJwt()];

        $response = $this->actions->removeAction($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    private function createAutoAction() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $action = DataMock::getAutoAction();
        $action->id = 0;

        $request->payload = $action;

        $response = $this->actions->addAction($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $response->status);

        return $response;
    }
}

