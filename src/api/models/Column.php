<?php
class Column extends BaseModel {

    public function __construct($container, $id = 0) {
        parent::__construct('column', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
    }

    public function loadFromBean($bean) {
    }

}

