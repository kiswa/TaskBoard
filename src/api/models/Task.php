<?php
class Task extends BaseModel {
    public $id = 0;
    public $title = '';
    public $description = '';
    public $assignee = null;  // User model
    public $category = null;  // Category model
    public $color = '';
    public $due_date = null;  // Date or null if not set
    public $points = null;    // Integer or null if not set
    public $position = 0;
    public $attachments = []; // Attachment model array
    public $comments = [];    // Comment model array

    public function __construct($container, $id = 0, $internal = false) {
        parent::__construct('column', $id, $container);

        if ($internal) {
            return;
        }

        $this->loadFromBean($this->bean);
    }

    public static function fromJson($container, $json) {
        $instance = new self($container, 0, true);
        $instance->loadFromJson($container, $json);

        return $instance;
    }

    public function updateBean() {
    }

    public function loadFromBean($container, $bean) {
    }

    public function loadFromJson($container, $json) {
    }
}

