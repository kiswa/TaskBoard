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

        $this->columns = new Columns(new ContainerMock());
    }

    public function testGetColumn() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No column found for ID 1.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->columns->getColumn(null,
            new ResponseMock(), $args);
        $this->assertEquals($expected, $actual);

        $this->createColumn();
        $actual = $this->columns->getColumn(null,
            new ResponseMock(), $args);
        $this->assertTrue($actual->status === 'success');
        $this->assertTrue(count($actual->data) === 1);
    }

    public function testAddRemoveColumn() {
        $expected = new ApiJson();

        $actual = $this->createColumn();

        $expected->setSuccess();
        $expected->addAlert('success', 'Column col1 added.');

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'Column col1 removed.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->columns->removeColumn(null,
            new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

    public function testAddBadColumn() {
        $request = new RequestMock();
        $request->invalidPayload = true;

        $response = $this->columns->addColumn($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');
    }

    public function testRemoveBadColumn() {
        $args = [];
        $args['id'] = 5; // No such column

        $response = $this->columns->removeColumn(null,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    public function testUpdateColumn() {
        $this->createColumn();

        $column = DataMock::getColumn();
        $column->name = 'updated';

        $args = [];
        $args['id'] = $column->id;

        $request = new RequestMock();
        $request->payload = $column;

        $response = $this->columns->updateColumn($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'success');

        $request->payload = new stdClass();
        $response = $this->columns->updateColumn($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->alerts[2]['type'] === 'error');
    }

    private function createColumn() {
        $request = new RequestMock();
        $column = DataMock::getColumn();
        $column->id = 0;

        $request->payload = $column;

        $response = $this->columns->addColumn($request,
            new ResponseMock(), null);
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

