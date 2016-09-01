<?php
class Board extends BaseModel {
    public $id = 0;
    public $name = '';
    public $is_active = true;
    public $columns = [];
    public $categories = [];
    public $auto_actions = [];
    public $issue_trackers = [];
    public $users = [];

    public function __construct($container, $id = 0) {
        parent::__construct('board', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->name = $this->name;
        $bean->is_active = $this->is_active;

        $this->updateBeanList($this->columns,
            $bean->xownColumnList);
        $this->updateBeanList($this->categories,
            $bean->xownCategoryList);
        $this->updateBeanList($this->auto_actions,
            $bean->xownAutoActionList);
        $this->updateBeanList($this->issue_trackers,
            $bean->xownIssueTrackerList);
        $this->updateBeanList($this->users,
            $bean->sharedUserList);
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

        $this->updateObjList($this->columns, $bean->xownColumnList,
            function($id) {
                return new Column($this->container, $id);
            });
        $this->updateObjList($this->categories, $bean->xownCategoryList,
            function($id) {
                return new Category($this->container, $id);
            });
        $this->updateObjList($this->auto_actions, $bean->xownAutoActionList,
            function($id) {
                return new AutoAction($this->container, $id);
            });
        $this->updateObjList($this->issue_trackers, $bean->xownIssueTrackerList,
            function($id) {
                return new IssueTracker($this->container, $id);
            });
        $this->updateObjList($this->users, $bean->sharedUserList,
            function($id) {
                return new User($this->container, $id);
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

        $this->loadArray(isset($obj->columns) ? $obj->columns : null,
            $this->columns, function($id) {
                return new Column($this->container, $id);
            });
        $this->loadArray(isset($obj->categories) ? $obj->categories : null,
            $this->categories, function($id) {
                return new Category($this->container, $id);
            });
        $this->loadArray(isset($obj->auto_actions) ? $obj->auto_actions : null,
            $this->auto_actions, function($id) {
                return new AutoAction($this->container, $id);
            });
        $this->loadArray(isset($obj->issue_trackers) ? $obj->issue_trackers : null,
            $this->issue_trackers, function($id) {
                return new IssueTracker($this->container, $id);
            });
        $this->loadArray(isset($obj->users) ? $obj->users : null,
            $this->users, function($id) {
                return new User($this->container, $id);
            });
    }

    private function loadArray($fromArray, &$toArray, $ctor) {
        if (is_null($fromArray)) {
            return;
        }

        foreach($fromArray as $item) {
            $obj = $ctor($item->id);

            if ($obj->id === 0) {
                $obj->loadFromJson(json_encode($item));
            }

            $toArray[] = $obj;
        }
    }

    private function loadPropertiesFrom($obj) {
        try {
            $this->id = (int) $obj->id;
            $this->name = $obj->name;
            $this->is_active = (bool) $obj->is_active;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

