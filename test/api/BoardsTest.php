<?php
require_once 'Mocks.php';

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

        $this->assertEquals($expected,
            $this->boards->getAllBoards(null, new ResponseMock(), null));
    }

    public function testGetBoard() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No board found for ID 1.');

        $args = [];
        $args['id'] = '1';

        $this->assertEquals($expected,
            $this->boards->getBoard(null, new ResponseMock(), $args));
    }

    public function testAddRemoveBoard() {
        $expected = new ApiJson();
        $expected->setSuccess();
        $expected->addAlert('success', 'Board  added.');

        $actual = $this->boards->addBoard(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'Board  removed.');

        $args = [];
        $args['id'] = '1';

        $actual = $this->boards->removeBoard(null, new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

}

