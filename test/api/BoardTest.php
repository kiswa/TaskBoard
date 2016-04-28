<?php
require_once 'Mocks.php';

class BoardTest extends PHPUnit_Framework_TestCase {
    private $json = '';
    private $bean;

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

    protected function setUp() {
        if ($this->json !== '') {
            return;
        }

        $board = DataMock::getBoard();
        $this->json = json_encode($board);
        $this->bean = $board;
    }

    // Just to get the complete code coverage
    public function testMockApp() {
        $expected = new ContainerMock();
        $appMock = new AppMock();
        $actual = $appMock->getContainer();

        $this->assertTrue($expected == $actual);
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

        $board = Board::fromBean(new ContainerMock(), $this->bean);
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

    public function testSaveAndDelete() {
        $board = Board::fromJson(new ContainerMock(),
            json_encode(DataMock::getBoard()));
        $board->save();

        $board = new Board(new ContainerMock(), 1);
        $this->assertTrue($board->id === 1);

        $board->delete();

        $board = new Board(new ContainerMock(), $board->id);
        $this->assertTrue($board->id === 0);
    }
}

