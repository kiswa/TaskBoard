<?php
require_once __DIR__ . '/../Mocks.php';

class AutoActionsTest extends PHPUnit_Framework_TestCase {
    private $boards;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        $this->actions = new AutoActions(new ContainerMock());
    }

    public function testGetAllActions() {

    }
}

