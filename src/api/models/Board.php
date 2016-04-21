<?php
class Board extends BaseModel {

    public function __construct($id = 0, $internal = false) {
        parent::__construct('board', $id);

        if ($internal) {
            return;
        }

        $this->loadFromBean($this->bean);
    }

    public static function fromBean($bean) {
    }

    public function updateBean() {
    }

    public function loadFromBean() {
    }

}

