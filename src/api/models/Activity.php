<?php

class Activity extends BaseModel {
    public $id = 0;
    public $user_id = 0;
    public $log_text ='';
    public $before = null;
    public $after = null;
    public $item_type = '';
    public $item_id = 0;

    public function __construct($container, $id = 0) {
        parent::__construct('activity', $id, $container);
    }

    public static function fromBean($container, $bean) {
        $instance = new self($container, 0);
        $instance->loadFromBean($container, $bean);

        return $instance;
    }

    public function updateBean() {
    }

    public function loadFromBean($container, $bean) {
    }

    public function loadFromJson($container, $obj) {
    }
}

