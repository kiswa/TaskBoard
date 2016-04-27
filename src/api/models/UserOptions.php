<?php
class UserOptions extends BaseModel {
    public $task_order = 0;
    public $show_animations = true;
    public $show_assignee = true;

    public function __construct($container, $id = 0) {
        parent::__construct('user', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
    }

    public function loadFromBean($container, $bean) {
    }

    public function loadFromJson($container, $obj) {
    }
}

