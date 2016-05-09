<?php

class Activity extends BaseModel {
    public $id = 0;
    public $user_id = 0;
    public $log_text ='';
    public $before = '';
    public $after = '';
    public $item_type = '';
    public $item_id = 0;

    public function __construct($container, $id = 0, $internal = false) {
        parent::__construct('activity', $id, $container);

        if ($internal) {
            return;
        }

        $this->loadFromBean($this->bean);
    }

    public static function fromBean($container, $bean) {
        $instance = new self($container, 0, true);
        $instance->loadFromBean($bean);

        return $instance;
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->user_id = $this->user_id;
        $bean->log_text = $this->log_text;
        $bean->before = $this->before;
        $bean->after = $this->after;
        $bean->item_type = $this->item_type;
        $bean->item_id = $this->item_id;
    }

    public function loadFromBean($bean) {
        if (!isset($bean->id)) {
            $this->is_valid = false;

            return;
        }

        if ($bean->id === 0) {
            return;
        }

        $this->is_valid = true;
        $this->loadPropertiesFrom($bean);
    }

    public function loadFromJson($json) {
        $obj = json_decode($json);

        if (!isset($obj->id)) {
            $this->is_valid = false;

            return;
        }

        if ($obj->id === 0) {
            return;
        }

        $this->is_valid = true;
        $this->loadPropertiesFrom($obj);
    }

    private function loadPropertiesFrom($obj) {
        $this->id = (int) $obj->id;
        $this->user_id = (int) $obj->user_id;
        $this->log_text = $obj->log_text;
        $this->before = $obj->before;
        $this->after = $obj->after;
        $this->item_type = $obj->item_type;
        $this->item_id = (int) $obj->item_id;
    }
}

