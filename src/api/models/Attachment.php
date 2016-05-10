<?php
class Attachment extends BaseModel {
    public $id = 0;
    public $filename = '';
    public $name = '';
    public $type = '';
    public $user = 0;
    public $timestamp = null;

    public function __construct($container, $id = 0) {
        parent::__construct('attachment', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->id = $this->id;
        $bean->filename = $this->filename;
        $bean->name = $this->name;
        $bean->type = $this->type;
        $bean->user = $this->user;
        $bean->timestamp = $this->timestamp;
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
            $this->filename = $obj->filename;
            $this->name = $obj->name;
            $this->type = $obj->type;
            $this->user = (int) $obj->user;
            $this->timestamp = (int) $obj->timestamp;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

