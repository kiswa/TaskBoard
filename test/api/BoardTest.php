<?php
require_once 'Mocks.php';

class BoardTest extends PHPUnit_Framework_TestCase {
    private $json = '';

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

        $board = new stdClass();
        $board->id = 1;
        $board->name = 'test';
        $board->is_active = true;
        $board->columns = [];

        $column = new stdClass();
        $column->id = 1;
        $column->name = 'col1';

        $category = new stdClass();
        $category->id = 1;
        $category->name = 'cat1';

        $auto_action = new stdClass();
        $auto_action->id = 1;
        $auto_action->trigger = ActionTrigger::MoveToColumn;
        $auto_action->trigger_id = 1;
        $auto_action->type = ActionType::SetColor;
        $auto_action->color = '#ffffff';

        $user = new stdClass();
        $user->id = 1;
        $user->security_level = 1;
        $user->username = 'tester';

        $board->columns[] = $column;
        $board->categories[] = $category;
        $board->auto_actions[] = $auto_action;
        $board->users[] = $user;

        $this->json = json_encode($board);
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

