<?php
class Board extends BaseModel {
    public $id = 0;
    public $name = '';
    public $is_active = true;
    public $columns = [];
    public $categories = [];
    public $auto_actions = [];
    public $users = [];

    public function __construct($container, $id = 0, $internal = false) {
        parent::__construct('board', $id, $container);

        if ($internal) {
            return;
        }

        $this->loadFromBean($container, $this->bean);
    }

    public static function fromBean($container, $bean) {
        $instance = new self($container, 0, true);
        $instance->loadFromBean($container, $bean);

        return $instance;
    }

    public static function fromJson($container, $json) {
        $instance = new self($container, 0, true);
        $instance->loadFromJson($container, $json);

        return $instance;
    }

    public function updateBean() {
    }

    public function loadFromBean($container, $bean) {
        if (!isset($bean->id) || $bean->id === 0) {
            return;
        }

        $this->id = $bean->id;
        $this->name = $bean->name;
        $this->is_active = $bean->is_active;

        $this->updateBean();
    }

    // TODO: Determine if all models should have loadFromJson method
    public function loadFromJson($container, $json) {
        $obj = json_decode($json);

        if (!isset($obj->id) || $obj->id === 0) {
            return;
        }

        $this->id = $obj->id;
        $this->name = $obj->name;
        $this->is_active = $obj->is_active;

        foreach($obj->columns as $col) {
            if ($col->id) {
                $this->columns[] = new Column($container, $col->id);
            } else {
                // TODO: Determine if all models should have fromObject method
                $this->columns[] = Column::fromObject($col);
            }
        }

        $this->updateBean();
    }

}

