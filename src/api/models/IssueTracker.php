<?php
class IssueTracker extends BaseModel {
    public $id = 0;
    public $url = '';
    public $regex = '';
    public $board_id = 0;

    public function __construct($container, $id = 0) {
        parent::__construct('issue_tracker', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->url = $this->url;
        $bean->regex = $this->regex;
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
            $this->url = $obj->url;
            $this->regex = $obj->regex;
            $this->board_id = (int) $obj->board_id;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

