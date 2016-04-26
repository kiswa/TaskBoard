<?php
class AutoAction extends BaseModel {

    public function __construct($container, $id = 0) {
        parent::__construct('auto_action', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
    }

    public function loadFromBean($container, $bean) {
    }

    public function loadFromJson($container, $obj) {
    }

}

