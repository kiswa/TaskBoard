<?php
class Comment extends BaseModel {

    public function __construct($container, $id = 0) {
        parent::__construct('comment', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
    }

    public function loadFromBean($container, $bean) {
    }

    public function loadFromJson($container, $obj) {
    }

}

