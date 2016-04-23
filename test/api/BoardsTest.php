<?php
require_once 'Mocks.php';

class BoardsTest extends PHPUnit_Framework_TestCase {
    private $boards;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public static function tearDownAfterClass() {
        if (file_exists('tests.db')) {
            unlink('tests.db');
        }
    }

    public function setup() {
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

    public function testAddBoard() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'Error adding board. ' .
            'Please check your entries and try again.');

        $this->assertEquals($expected,
            $this->boards->addBoard(new RequestMock(),
                new ResponseMock(), null));
    }

    public function testRemoveBoard() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'Error removing board. ' .
            'No board found for ID 1.');

        $args = [];
        $args['id'] = '1';

        $this->assertEquals($expected,
            $this->boards->removeBoard(null, new ResponseMock(), $args));
    }

}

