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

        $bean->title = $this->title;
        $bean->description = $this->description;
        $bean->assignee = (string) $this->assignee;
        $bean->category_id = (string) $this->category_id;
        $bean->column_id = (string) $this->column_id;
        $bean->color = $this->color;
        $bean->due_date = $this->due_date;
        $bean->points = (string) $this->points;
        $bean->position = (string) $this->position;

        $this->updateBeanList($this->attachments,
            $bean->xownAttachmentList);
        $this->updateBeanList($this->comments,
            $bean->xownCommentList);
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

        $this->updateObjList($this->attachments, $bean->xownAttachmentList,
            function($id) {
                return new Attachment($this->container, $id);
            });
        $this->updateObjList($this->comments, $bean->xownCommentList,
            function($id) {
                return new Comment($this->container, $id);
            });
    }

    public function loadFromJson($json) {
        $obj = json_decode($json);

        if (!isset($obj->id)) {
            $this->is_valid = false;

            return;
        }

        $this->is_valid = true;
        $this->loadPropertiesFrom($obj);

        if (isset($obj->attachments)) {
            foreach($obj->attachments as $item) {
                $this->attachments[] =
                    new Attachment($this->container, $item->id);
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

