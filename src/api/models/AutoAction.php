<?php
use MyCLabs\Enum\Enum;

class ActionTrigger extends Enum {
    const MoveToColumn = 1;
    const AssignedToUser = 2;
    const SetToCategory = 3;
}

class ActionType extends Enum {
    const SetColor = 1;
    const SetCategory = 2;
    const SetAssignee = 3;
    const ClearDueDate = 4;
}

class AutoAction extends BaseModel {
    public $id = 0;
    public $trigger = ActionTrigger::MoveToColumn;
    public $trigger_id = 0; // ID of the column etc. which triggers the action
    public $type = ActionType::SetColor;
    // These are the target change to make when the action
    // is performed. Only one will be set in an action.
    // TODO: Consider other ways to do this.
    public $color = '';
    public $category_id = 0;
    public $assignee_id = 0;

    public function __construct($container, $id = 0, $internal = false) {
        parent::__construct('auto_action', $id, $container);

        if ($internal) {
            return;
        }

        $this->loadFromBean($this->bean);
    }

    public static function fromBean($container, $bean) {
        $instance = new self($container, 0, true);
        $instance->loadFromBean($container, $bean);

        return $instance;
    }

    public static function fromJson($container, $json) {
        $instance = new self($container, 0, true);
        $instance->loadFromJson($container, $json);

        return $instance;
    }

    public function updateBean() {
    }

    public function loadFromBean($container, $bean) {
    }

    public function loadFromJson($container, $obj) {
    }
}

