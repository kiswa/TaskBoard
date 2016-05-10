<?php
require_once __DIR__ . '/../Mocks.php';

class BoardTest extends PHPUnit_Framework_TestCase {
    private $json = '';
    private $bean;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    protected function setUp() {
        RedBeanPHP\R::nuke();

        if ($this->json !== '') {
            return;
        }

        $board = DataMock::getBoard();
        $this->json = json_encode($board);
        $this->bean = $board;
        // Convert to bean format
        $this->bean->xownColumnList = $board->columns;
        $this->bean->xownCategoryList = $board->categories;
        $this->bean->xownAutoActionList = $board->auto_actions;
        $this->bean->ownUserList = $board->users;
    }

    private function assertDefaultProperties($board) {
        $this->assertTrue($board->id === 0);
        $this->assertTrue($board->name === '');
        $this->assertTrue($board->is_active === true);
        $this->assertArraySubset($board->columns, []);
        $this->assertArraySubset($board->categories, []);
        $this->assertArraySubset($board->auto_actions, []);
        $this->assertArraySubset($board->users, []);
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
        $this->assertDefaultProperties($board);
    }

    public function testCreateFromBean() {
        $board = new Board(new ContainerMock());
        $board->loadFromBean(null);

        $this->assertDefaultProperties($board);

        $board->loadFromBean($this->bean);

        $this->assertTrue($board->id === 1);
        $this->assertTrue($board->name === 'test');
        $this->assertTrue($board->is_active === true);
    }

    public function testCreateFromJson() {
        $board = new Board(new ContainerMock());
        $board->loadFromJson(null);

        $this->assertDefaultProperties($board);

        $board->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($board);

        $board->loadFromJson($this->json);

        $this->assertTrue($board->id === 1);
        $this->assertTrue($board->name === 'test');
        $this->assertTrue($board->is_active === true);
    }

    public function testSaveLoadDelete() {
        $board = new Board(new ContainerMock());
        $board->loadFromJson($this->json);

        $board->save();
        $this->assertTrue($board->id === 1);

        $board = new Board(new ContainerMock(), 1);
        $this->assertTrue($board->id === 1);

        $board->delete();

        $board = new Board(new ContainerMock(), 1);
        $this->assertTrue($board->id === 0);
    }

    public function testGetBean() {
        $board = new Board(new ContainerMock());
        $bean = $board->getBean();

        // Make sure bean properties exist
        $this->assertTrue($bean->id === 0);
        $this->assertArraySubset($bean->xownColumnList, []);

        $this->assertTrue($board->save());
        $bean = $board->getBean();

        $this->assertTrue((int)$bean->id === 1);
    }
}

