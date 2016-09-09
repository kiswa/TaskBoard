<?php
class Comment extends BaseModel {
    public $id = 0;
    public $text = '';
    public $user_id = 0;
    public $task_id = 0;

    public function __construct($container, $id = 0) {
        parent::__construct('comment', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->text = $this->text;
        $bean->user_id = (string) $this->user_id;
        $bean->task_id = (string) $this->task_id;
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
            $this->text = $obj->text;
            $this->user_id = $obj->user_id;
            $this->task_id = $obj->task_id;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

