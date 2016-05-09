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

        $this->actions = new AutoActions(new ContainerMock());
    }

    public function testGetAllActions() {
        $expected = new ApiJson();
        $expected->addAlert('info', 'No automatic actions in database.');

        $actual =
            $this->actions->getAllActions(null, new ResponseMock(), null);
        $this->assertEquals($expected, $actual);

        $this->createAutoAction();

        $actions =
            $this->actions->getAllActions(null, new ResponseMock(), null);
        $this->assertTrue(count($actions->data) === 1);
        $this->assertTrue($actions->status === 'success');
    }

    public function testAddRemoveAction() {
        $expected = new ApiJson();

        $actual = $this->createAutoAction();

        $expected->setSuccess();
        $expected->addAlert('success', 'Automatic action added.');

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'Automatic action removed.');

        $args = [];
        $args['id'] = '1';

        $actual = $this->actions->removeAction(null, new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

    public function testAddBadAction() {
        $request = new RequestMock();
        $request->invalidPayload = true;

        $response = $this->actions->addAction($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');
    }

    public function testRemoveBadAction() {
        $args = [];
        $args['id'] = 5; // No such action

        $response = $this->actions->removeAction(null,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    private function createAutoAction() {
        $request = new RequestMock();
        $action = DataMock::getAutoAction();
        $action->id = 0;

        $request->payload = $action;

        $response = $this->actions->addAction($request,
            new ResponseMock(), null);
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

