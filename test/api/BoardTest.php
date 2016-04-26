<?php
require_once 'Mocks.php';

class BoardTest extends PHPUnit_Framework_TestCase {
    private $json = '{ "id": 1, "name": "test", "is_active": true }';

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

    public function testCreateNewBoard() {
        $board = new Board(new ContainerMock());

        $this->assertTrue($board->id === 0);
        $this->assertTrue($board->name === '');
        $this->assertTrue($board->is_active === true);
        $this->assertArraySubset($board->columns, []);
    }

    public function testCreateFromBean() {
        $board = Board::fromBean(new ContainerMock(), null);

        $this->assertTrue($board->id === 0);
        $this->assertTrue($board->name === '');
        $this->assertTrue($board->is_active === true);
        $this->assertArraySubset($board->columns, []);
    }

    public function testCreateFromJson() {
        $board = Board::fromJson(new ContainerMock(), null);

        $this->assertTrue($board->id === 0);
        $this->assertTrue($board->name === '');
        $this->assertTrue($board->is_active === true);
        $this->assertArraySubset($board->columns, []);

        $board = Board::fromJson(new ContainerMock(), $this->json);

        $this->assertTrue($board->id === 1);
        $this->assertTrue($board->name === 'test');
        $this->assertTrue($board->is_active === true);
    }

}

