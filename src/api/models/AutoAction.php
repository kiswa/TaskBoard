<?php
class AutoAction extends BaseModel {

    public function __construct($container, $id = 0) {
        parent::__construct('auto_action', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
    }

    public abstract function loadFromBean($container, $bean) {
    }

    public abstract function loadFromJson($container, $obj) {
    }

}

