<?php
require_once __DIR__ . '/../Mocks.php';

class AutoActionTest extends PHPUnit_Framework_TestCase {
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

        $action = DataMock::getAutoAction();
        $this->json = json_encode($action);
        $this->bean = $action;
    }

    public function testCreateNewAutoAction() {
        $action = new AutoAction(new ContainerMock());
        $this->assertDefaultProperties($action);
    }

    public function testLoadFromJson() {
        $action = new AutoAction(new ContainerMock());

        $action->loadFromJson('');
        $this->assertDefaultProperties($action);

        $action->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($action);

        $action->loadFromJson($this->json);
        $this->assertMockProperties($action);
    }

    public function testLoadFromBean() {
        $action = new AutoAction(new ContainerMock());

        $action->loadFromBean(null);
        $this->assertDefaultProperties($action);

        $action->loadFromBean($this->bean);
        $this->assertMockProperties($action);
    }

    public function testUpdateBean() {
        $action = new AutoAction(new ContainerMock());
        $action->loadFromBean($this->bean);

        $action->updateBean();
        $bean = $action->getBean();

        $this->assertEquals($bean->trigger, $action->trigger->getValue());
        $this->assertEquals($bean->source_id ,$action->source_id);
        $this->assertEquals($bean->type, $action->type->getValue());
        $this->assertEquals($bean->change_to, $action->change_to);
    }

    private function assertMockProperties($attachment) {
        $trigger = new ActionTrigger(ActionTrigger::SetToCategory);
        $type = new ActionType(ActionType::ClearDueDate);

        $this->assertEquals(1, $attachment->id);
        $this->assertEquals(1, $attachment->board_id);
        $this->assertEquals($trigger->getValue(),
            $attachment->trigger->getValue());
        $this->assertEquals(1, $attachment->source_id);
        $this->assertEquals($type->getValue(), $attachment->type->getValue());
        $this->assertEquals('null', $attachment->change_to);
    }

    private function assertDefaultProperties($attachment) {
        $this->assertEquals(0, $attachment->id);
        $this->assertEquals(0, $attachment->board_id);
        $this->assertEquals(ActionTrigger::MoveToColumn,
            $attachment->trigger->getValue());
        $this->assertEquals(0, $attachment->source_id);
        $this->assertEquals(ActionType::SetColor,
            $attachment->type->getValue());
        $this->assertEquals('', $attachment->change_to);
    }
}

