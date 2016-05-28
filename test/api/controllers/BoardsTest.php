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

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->boards = new Boards(new ContainerMock());
    }

    public function testGetAllBoards() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->boards->getAllBoards($request,
            new ResponseMock(), null);
        $this->assertEquals('No boards in database.',
            $actual->alerts[0]['text']);;

        $this->createBoard();

        $request->header = [DataMock::getJwt()];
        $this->boards = new Boards(new ContainerMock());

        $boards = $this->boards->getAllBoards($request,
            new ResponseMock, null);
        $this->assertEquals(2, count($boards->data));
        $this->assertEquals('success', $boards->status);

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request->header = [DataMock::getJwt(2)];
        $this->boards = new Boards(new ContainerMock());

        $actual = $this->boards->getAllBoards($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testGetBoard() {
        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->boards->getBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('No board found for ID 1.',
            $actual->alerts[0]['text']);

        $this->createBoard();
        $this->boards = new Boards(new ContainerMock());
        $request->header = [DataMock::getJwt()];

        $actual = $this->boards->getBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request->header = [DataMock::getJwt(2)];
        $this->boards = new Boards(new ContainerMock());

        $actual = $this->boards->getBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveBoard() {
        $actual = $this->createBoard();

        $this->assertEquals('Board test added.',
            $actual->alerts[0]['text']);

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $this->boards = new Boards(new ContainerMock());
        $actual = $this->boards->removeBoard($request,
            new ResponseMock(), $args);

        $this->assertEquals('Board test removed.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveBoardUnpriviliged() {
        $args = [];
        $args['id'] = 1;

        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $this->boards = new Boards(new ContainerMock());

        $actual = $this->boards->addBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $this->boards = new Boards(new ContainerMock());
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->boards->removeBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveBadBoard() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->boards->addBoard($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 5; // No such board

        $this->boards = new Boards(new ContainerMock());

        $response = $this->boards->removeBoard($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    public function testUpdateBoard() {
        $this->createBoard();

        $board = DataMock::getBoard();
        $board->is_active = false;

        $args = [];
        $args['id'] = $board->id;

        $this->boards = new Boards(new ContainerMock());
        $request = new RequestMock();
        $request->payload = $board;
        $request->header = [DataMock::getJwt()];

        $response = $this->boards->updateBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);

        $this->boards = new Boards(new ContainerMock());
        $request->payload = new stdClass();
        $request->header = [DataMock::getJwt()];

        $response = $this->boards->updateBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('error', $response->alerts[0]['type']);

        $this->boards = new Boards(new ContainerMock());
        $request->header = null;

        $response = $this->boards->updateBoard($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    private function createBoard() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $response = $this->boards->addBoard($request,
            new ResponseMock(), null);
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

