<?php
require_once 'Mocks.php';

class BoardsTest extends PHPUnit_Framework_TestCase {

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

    public function testGetAllBoards() {
        $boards = new Boards(new ContainerMock());

        $expected = new ApiJson();
        $expected->addAlert('info', 'No boards in database.');

        $this->assertEquals($expected,
            $boards->getAllBoards(null, new ResponseMock(), null));
    }

    public function testGetBoard() {
        $boards = new Boards(new ContainerMock());

        $expected = new ApiJson();
        $expected->addAlert('error', 'No board found for ID 1.');

        $args = [];
        $args['id'] = '1';

        $this->assertEquals($expected,
            $boards->getBoard(null, new ResponseMock(), $args));
    }

}

