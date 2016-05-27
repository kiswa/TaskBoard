<?php
class Column extends BaseModel {
    public $id = 0;
    public $name = '';
    public $position = 0;
    public $board_id = 0;
    public $tasks = []; // Task model array

    public function __construct($container, $id = 0) {
        parent::__construct('column', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->id = $this->id;
        $bean->name = $this->name;
        $bean->position = $this->position;
        $bean->board_id = $this->board_id;
        $bean->xownTaskList = [];

        foreach($this->tasks as $task) {
            $bean->xownTaskList[] = $task->bean;
        }
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
        $this->tasks = [];

        if (isset($bean->xownTaskList)) {
            foreach($bean->xownTaskList as $item) {
                $this->tasks[] = new Task($this->container, $item->id);
            }
        }
    }

    public function loadFromJson($json) {
        $obj = json_decode($json);

        if (!isset($obj->id)) {
            $this->is_valid = false;

            return;
        }

        $this->is_valid = true;
        $this->loadPropertiesFrom($obj);
        $this->tasks = [];

        if (isset($obj->tasks)) {
            foreach($obj->tasks as $item) {
                $this->tasks[] = new Task($this->container, $item->id);
            }
        }
    }

    private function loadPropertiesFrom($obj) {
        try {
            $this->id = (int) $obj->id;
            $this->name = $obj->name;
            $this->position = (int) $obj->position;
            $this->board_id = (int) $obj->board_id;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

