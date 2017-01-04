<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class ColumnsTest extends PHPUnit_Framework_TestCase {
    private $columns;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        R::nuke();
        Auth::CreateInitialAdmin(new ContainerMock());

        $this->columns = new Columns(new ContainerMock());
    }

    public function testGetColumn() {
        $this->createColumn();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->columns->getColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetColumnNotFound() {
        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->columns->getColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $actual->status);
    }

    public function testGetColumnUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->columns->getColumn($request,
            new ResponseMock(), null);

        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testGetColumnForbidden() {
        $this->createColumn();
        DataMock::CreateBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->columns->getColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testAddColumn() {
        $board = R::dispense('board');
        R::store($board);

        $this->createColumn();
        $data = $this->getColumnData();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $data;

        $actual = $this->columns->addColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);
    }

    public function testAddColumnUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->columns->addColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddColumnInvalid() {
        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->invalidPayload = true;

        $response = $this->columns->addColumn($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testAddColumnForbidden() {
        $this->createColumn();
        DataMock::CreateBoardAdminUser();

        $column = $this->getColumnData();
        $column->id = 0;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];
        $request->payload = $column;

        $actual = $this->columns->addColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateColumn() {
        $this->createColumn();

        $column = $this->getColumnData();
        $column->id = 1;
        $column->name = 'updated';

        $args = [];
        $args['id'] = $column->id;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $column;

        $response = $this->columns->updateColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);
    }

    public function testUpdateColumnUnprivileged() {
        $this->createColumn();
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->columns->updateColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateColumnForbidden() {
        $this->createColumn();
        DataMock::CreateBoardAdminUser();

        $column = $this->getColumnData();
        $column->id = 1;
        $column->name = 'test';

        $args = [];
        $args['id'] = $column->id;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];
        $request->payload = $column;

        $this->columns = new Columns(new ContainerMock());

        $actual = $this->columns->updateColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateColumnInvalid() {
        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->invalidPayload = true;

        $response = $this->columns->updateColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testRemoveColumn() {
        $this->createColumn();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $actual = $this->columns->removeColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
    }

    public function testRemoveColumnUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->columns->removeColumn($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveColumnInvalid() {
        $args = [];
        $args['id'] = 1; // No such column

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $response = $this->columns->removeColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testRemoveColumnForbidden() {
        $this->createColumn();
        DataMock::CreateBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->columns->removeColumn($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    private function getColumnData() {
        $data = new stdClass();

        $data->name = 'test';
        $data->position = 0;
        $data->board_id = 1;

        return $data;
    }

    private function createColumn() {
        $column = R::dispense('column');

        $board = R::dispense('board');
        $board->xownColumnList[] = $column;

        R::store($board);
    }
}

