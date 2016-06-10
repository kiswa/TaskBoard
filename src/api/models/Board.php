<?php
class Board extends BaseModel {
    public $id = 0;
    public $name = '';
    public $is_active = true;
    public $columns = [];
    public $categories = [];
    public $auto_actions = [];
    public $users = [];

    public function __construct($container, $id = 0) {
        parent::__construct('board', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->name = $this->name;
        $bean->is_active = $this->is_active;

        $bean->xownColumnList = [];
        $bean->xownCategoryList = [];
        $bean->xownAutoActionList = [];
        $bean->sharedUserList = [];

        foreach($this->columns as $col) {
            $col->updateBean();
            $this->bean->xownColumnList[] = $col->bean;
        }

        foreach($this->categories as $cat) {
            $cat->updateBean();
            $this->bean->xownCategoryList[] = $cat->bean;
        }

        foreach($this->auto_actions as $act) {
            $act->updateBean();
            $this->bean->xownAutoActionList[] = $act->bean;
        }

        foreach($this->users as $user) {
            $user->updateBean();
            $this->bean->sharedUserList[] = $user->bean;
        }
    }

    public function loadFromBean($bean) {
        if (!isset($bean->id)) {
            $this->is_valid = false;

            return;
        }

        if($bean->id === 0) {
            return;
        }

        $this->is_valid = true;

        $this->loadPropertiesFrom($bean);
        $this->resetArrays();

        foreach($bean->xownColumnList as $item) {
            $this->columns[] = new Column($this->container, $item->id);
        }

        foreach($bean->xownCategoryList as $item) {
            $this->categories[] =
                new Category($this->container, $item->id);
        }

        foreach($bean->xownAutoActionList as $item) {
            $this->auto_actions[] =
                new AutoAction($this->container, $item->id);
        }

        foreach($bean->sharedUserList as $item) {
            $this->users[] = new User($this->container, $item->id);
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
        $this->resetArrays();

        if (isset($obj->columns)) {
            foreach($obj->columns as $item) {
                $this->columns[] = new Column($this->container, $item->id);
            }
        }

        if (isset($obj->categories)) {
            foreach($obj->categories as $item) {
                $this->categories[] =
                    new Category($this->container, $item->id);
            }
        }

        if (isset($obj->auto_actions)) {
            foreach($obj->auto_actions as $item) {
                $this->auto_actions[] =
                    new AutoAction($this->container, $item->id);
            }
        }

        if (isset($obj->users)) {
            foreach($obj->users as $item) {
                $this->users[] = new User($this->container, $item->id);
            }
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

    private function resetArrays() {
        $this->columns = [];
        $this->categories = [];
        $this->auto_actions = [];
        $this->users = [];
    }
}

