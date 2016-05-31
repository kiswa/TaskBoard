<?php
class Task extends BaseModel {
    public $id = 0;
    public $title = '';
    public $description = '';
    public $assignee = 0;
    public $category_id = 0;
    public $column_id = 0;
    public $color = '';
    public $due_date = null;  // Date or null if not set
    public $points = null;    // Integer or null if not set
    public $position = 0;
    public $attachments = []; // Attachment model array
    public $comments = [];    // Comment model array

    public function __construct($container, $id = 0) {
        parent::__construct('task', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->id = $this->id;
        $bean->title = $this->title;
        $bean->description = $this->description;
        $bean->assignee = $this->assignee;
        $bean->category_id = $this->category_id;
        $bean->column_id = $this->column_id;
        $bean->color = $this->color;
        $bean->due_date = $this->due_date;
        $bean->points = $this->points;
        $bean->position = $this->position;

        $bean->xownAttachmentList = [];
        $bean->xownCommentList = [];

        foreach($this->attachments as $attachment) {
            $attachment->updateBean();
            $bean->xownAttachmentList[] = $attachment->bean;
        }

        foreach($this->comments as $comment) {
            $comment->updateBean();
            $bean->xownCommentList[] = $comment->bean;
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

        $this->attachments = [];
        $this->comments = [];

        if (isset($bean->xownAttachmentList)) {
            foreach($bean->xownAttachmentList as $item) {
                $this->attachments[] =
                    new Attachment($this->container, $item->id);
            }
        }

        if (isset($bean->xownCommentList)) {
            foreach($bean->xownCommentList as $item) {
                $this->comments[] = new Comment($this->container, $item->id);
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

        $this->attachments = [];
        $this->comments = [];

        if (isset($obj->attachments)) {
            foreach($obj->attachments as $item) {
                $this->comments[] = new Attachment($this->container, $item->id);
            }
        }

        if (isset($obj->comments)) {
            foreach($obj->comments as $item) {
                $this->comments[] = new Comment($this->container, $item->id);
            }
        }
    }

    private function loadPropertiesFrom($obj) {
        try {
            $this->id = (int)$obj->id;
            $this->title = $obj->title;
            $this->description = $obj->description;
            $this->assignee = (int)$obj->assignee;
            $this->category_id = (int)$obj->category_id;
            $this->column_id = (int)$obj->column_id;
            $this->color = $obj->color;
            $this->due_date = $obj->due_date;
            $this->points = $obj->points;
            $this->position = (int)$obj->position;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

