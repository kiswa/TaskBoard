<?php
require_once 'Mocks.php';

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

    public function testCreateAttachment() {
        $action = new AutoAction(new ContainerMock());
        $this->assertDefaultProperties($action);
    }

    public function testLoadFromJson() {
        $action = new AutoAction(new ContainerMock());

        $action->loadFromJson('');
        $this->assertDefaultProperties($action);

        $action->loadFromJson($this->json);
        $this->assertMockProperties($action);
    }

    public function testLoadFromBean() {
        $action = new AutoAction(new ContainerMock());

        $action->loadFromBean($this->bean);
        $this->assertMockProperties($action);
    }

    public function testUpdateBean() {
        $action = new AutoAction(new ContainerMock());
        $action->loadFromBean($this->bean);

        $action->updateBean();
        $bean = $action->getBean();

        $this->assertTrue($bean->id === $action->id);
        $this->assertTrue($bean->trigger === $action->trigger);
        $this->assertTrue($bean->trigger_id === $action->trigger_id);
        $this->assertTrue($bean->type === $action->type);
        $this->assertTrue($bean->change_to === $action->change_to);
    }

    private function assertMockProperties($attachment) {
        $trigger = new ActionTrigger(ActionTrigger::SetToCategory);
        $type = new ActionType(ActionType::ClearDueDate);

        $this->assertTrue($attachment->id === 1);
        $this->assertTrue($attachment->trigger->getValue() ===
            $trigger->getValue());
        $this->assertTrue($attachment->trigger_id === 1);
        $this->assertTrue($attachment->type->getValue() ===
            $type->getValue());
        $this->assertTrue($attachment->change_to === 'null');
    }

    private function assertDefaultProperties($attachment) {
        $this->assertTrue($attachment->id === 0);
        $this->assertTrue($attachment->trigger ==
            ActionTrigger::MoveToColumn);
        $this->assertTrue($attachment->trigger_id === 0);
        $this->assertTrue($attachment->type == ActionType::SetColor);
        $this->assertTrue($attachment->change_to === '');

    }
}

