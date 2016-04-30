<?php
class Task extends BaseModel {
    public $id = 0;
    public $title = '';
    public $description = '';
    public $assignee_id = 0;
    public $category_id = 0;  // Category model
    public $color = '';
    public $due_date = null;  // Date or null if not set
    public $points = null;    // Integer or null if not set
    public $position = 0;
    public $attachments = []; // Attachment model array
    public $comments = [];    // Comment model array

    public function __construct($container, $id = 0) {
        parent::__construct('column', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->id = $this->id;
        $bean->title = $this->title;
        $bean->description = $this->description;
        $bean-> assignee_id = $this->assignee_id;
        $bean-> category_id = $this->category_id;
        $bean->color = $this->color;
        $bean->due_date = $this->due_date;
        $bean->points = $this->points;
        $bean->position = $this->position;

        $bean-> xownAttachmentList = [];
        $bean->xownCommentList = [];

        foreach($this->attachments as $attachment) {
            $attachment->updateBean();
            $this->xownAttachmentList[] = $attachment->bean;
        }

        foreach($this->comments as $comment) {
            $comment->updateBean();
            $this->xownCommentList[] = $comment->bean;
        }
    }

    public function loadFromBean($bean) {
        if (!isset($bean->id) || $bean->id === 0) {
            return;
        }

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

        if (!isset($obj->id) || $obj->id === 0) {
            return;
        }

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
        $this->id = $obj->id;
        $this->title = $obj->title;
        $this->description = $obj->description;
        $this->assignee_id = $obj->assignee_id;
        $this->category_id = $obj->category_id;
        $this->color = $obj->color;
        $this->due_date = $obj->due_date;
        $this->points = $obj->points;
        $this->position = $obj->position;
    }
}

