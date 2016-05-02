<?php
class Category extends BaseModel {
    public $id = 0;
    public $name = '';

    public function __construct($container, $id = 0) {
        parent::__construct('column', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->id = $this->id;
        $bean->name = $this->name;
    }

    public function loadFromBean($bean) {
        if (!isset($bean->id) || $bean->id === 0) {
            return;
        }

        $this->loadPropertiesFrom($bean);
    }

    public function loadFromJson($json) {
        $obj = json_decode($json);

        if (!isset($obj->id) || $obj->id === 0) {
            return;
        }

        $this->loadPropertiesFrom($obj);
    }

    private function loadPropertiesFrom($obj) {
        $this->id = (int) $obj->id;
        $this->name = $obj->name;
    }
}

