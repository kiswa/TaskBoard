<?php
require 'Mocks.php';

class BoardsTest extends PHPUnit_Framework_TestCase {

    public static function setupBeforeClass() {
        RedBeanPHP\R::setup('sqlite:tests.db');
    }

    public static function tearDownAfterClass() {
        unlink('tests.db');
    }

    public function testGetAllBoards() {
        $boards = new Boards(new ControllerMock());

        $expected = new ApiJson();
        $expected->addAlert('info', 'No boards in database.');

        $this->assertEquals($expected,
            $boards->getAllBoards(null, new ResponseMock(), null));
    }

}

