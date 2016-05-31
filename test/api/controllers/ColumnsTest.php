<?php
require_once __DIR__ . '/../Mocks.php';

class ColumnsTest extends PHPUnit_Framework_TestCase {
    private $columns;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
            // RedBeanPHP\R::fancyDebug(true);
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->columns = new Columns(new ContainerMock());
    }

    public function testGetColumn() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->columns->getColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $actual->status);

        $this->createColumn();
        $this->columns = new Columns(new ContainerMock());
        $request->header = [DataMock::getJwt()];

        $actual = $this->columns->getColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetColumnUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->columns->getColumn($request,
            new ResponseMock(), null);

        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveColumn() {
        $actual = $this->createColumn();
        $this->assertEquals('success', $actual->status);

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->columns->removeColumn($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $actual->status);
    }

    public function testAddRemoveColumnUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $column = DataMock::getColumn();
        $column->id = 0;

        $request->payload = $column;

        $actual = $this->columns->addColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $args = [];
        $args['id'] = 1;

        $request->header = [DataMock::getJwt(2)];

        $actual = $this->columns->removeColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddBadColumn() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->columns->addColumn($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testRemoveBadColumn() {
        $args = [];
        $args['id'] = 5; // No such column

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $response = $this->columns->removeColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testUpdateColumn() {
        $this->createColumn();

        $column = DataMock::getColumn();
        $column->name = 'updated';

        $args = [];
        $args['id'] = $column->id;

        $request = new RequestMock();
        $request->payload = $column;
        $request->header = [DataMock::getJwt()];

        $response = $this->columns->updateColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);

        $request->payload = new stdClass();
        $request->header = [DataMock::getJwt()];

        $response = $this->columns->updateColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('error', $response->alerts[2]['type']);
    }

    public function testUpdateColumnUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->createColumn();
        $this->columns = new Columns(new ContainerMock());

        $column = DataMock::getColumn();
        $column->name = 'updated';

        $args = [];
        $args['id'] = $column->id;

        $request = new RequestMock();
        $request->payload = $column;
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->columns->updateColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    private function createColumn() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $column = DataMock::getColumn();
        $column->id = 0;

        $request->payload = $column;

        $response = $this->columns->addColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $response->status);

        return $response;
    }
}

