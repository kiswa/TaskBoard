<?php
class Column extends BaseModel {
    public $id = 0;
    public $name = '';
    public $position = 0;
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
        $bean->xownTaskList = [];

        foreach($this->tasks as $task) {
            $bean->xownTaskList[] = $task->bean;
        }
    }

    public function loadFromBean($bean) {
        if (!isset($bean->id) || $bean->id === 0) {
            return;
        }

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

        if (!isset($obj->id) || $obj->id === 0) {
            return;
        }

        $this->loadPropertiesFrom($obj);
        $this->tasks = [];

        if (isset($obj->tasks)) {
            foreach($obj->tasks as $item) {
                $this->tasks[] = new Task($this->container, $item->id);
            }
        }
    }

    private function loadPropertiesFrom($obj) {
        $this->id = (int) $obj->id;
        $this->name = $obj->name;
        $this->position = (int) $obj->position;
    }
}

