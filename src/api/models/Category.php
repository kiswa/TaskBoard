<?php
class Category extends BaseModel {
    public $id = 0;
    public $name = '';
    public $default_task_color = '';
    public $board_id = 0;

    public function __construct($container, $id = 0) {
        parent::__construct('category', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->name = $this->name;
        $bean->default_task_color = $this->default_task_color;
        $bean->board_id = (string) $this->board_id;
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

        $this->is_valid = true;
        $this->loadPropertiesFrom($obj);
    }

    private function loadPropertiesFrom($obj) {
        try {
            $this->id = (int) $obj->id;
            $this->name = $obj->name;
            $this->default_task_color = $obj->default_task_color;
            $this->board_id = $obj->board_id;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

