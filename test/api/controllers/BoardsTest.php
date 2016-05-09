<?php
require_once __DIR__ . '/../Mocks.php';

class BoardsTest extends PHPUnit_Framework_TestCase {
    private $boards;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        $this->boards = new Boards(new ContainerMock());
    }

    public function testGetAllBoards() {
        $expected = new ApiJson();
        $expected->addAlert('info', 'No boards in database.');

        $actual = $this->boards->getAllBoards(null, new ResponseMock(), null);
        $this->assertEquals($expected, $actual);

        $this->createBoard();

        $boards = $this->boards->getAllBoards(null, new ResponseMock, null);
        $this->assertTrue(count($boards->data) === 1);
        $this->assertTrue($boards->status === 'success');
    }

    public function testGetBoard() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No board found for ID 1.');

        $args = [];
        $args['id'] = '1';

        $actual = $this->boards->getBoard(null, new ResponseMock(), $args);
        $this->assertEquals($expected, $actual);

        $this->createBoard();
        $actual = $this->boards->getBoard(null, new ResponseMock(), $args);
        $this->assertTrue($actual->status === 'success');
        $this->assertTrue(count($actual->data) === 1);
    }

    public function testAddRemoveBoard() {
        $expected = new ApiJson();

        $actual = $this->createBoard();

        $expected->setSuccess();
        $expected->addAlert('success', 'Board test added.');

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'Board test removed.');

        $args = [];
        $args['id'] = '1';

        $actual = $this->boards->removeBoard(null, new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

    public function testAddBadBoard() {
        $request = new RequestMock();
        $request->invalidPayload = true;

        $response = $this->boards->addBoard($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');
    }

    public function testRemoveBadBoard() {
        $args = [];
        $args['id'] = 5; // No such board

        $response =
            $this->boards->removeBoard(null, new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    public function testUpdateBoard() {
        $this->createBoard();

        $board = DataMock::getBoard();
        $board->is_active = false;

        $args = [];
        $args['id'] = $board->id;

        $request = new RequestMock();
        $request->payload = $board;

        $response = $this->boards->updateBoard($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'success');

        $request->payload = new stdClass();
        $response = $this->boards->updateBoard($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->alerts[2]['type'] === 'error');
    }

    private function createBoard() {
        $response = $this->boards->addBoard(new RequestMock(),
            new ResponseMock(), DataMock::getBoard());
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

