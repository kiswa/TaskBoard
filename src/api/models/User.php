<?php
use MyCLabs\Enum\Enum;

class SecurityLevel extends Enum {
    const Admin = 1;
    const BoardAdmin = 2;
    const User = 3;
}

class User extends BaseModel {
    public $id = 0;
    public $security_level = SecurityLevel::User;
    public $username = '';
    public $salt = '';
    public $password_hash = '';
    public $email = '';
    public $default_board_id = 0;
    public $options = []; // UserOptions model

    public function __construct($container, $id = 0) {
        parent::__construct('user', $id, $container);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->id = $this->id;
        $bean->security_level = $this->security_level;
        $bean->username = $this->username;
        $bean->salt = $this->salt;
        $bean->password_hash = $this->password_hash;
        $bean->email = $this->email;
        $bean->default_board_id = $this->default_board_id;
        $bean->xownOptionList = [];

        foreach($this->options as $option) {
            $bean->xownOptionList[] = $option->bean;
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
        $this->options = [];

        if (isset($bean->xownOptionList)) {
            foreach($bean->xownOptionList as $item) {
                $this->options[] = new UserOptions($this->container, $item->id);
            }
        }
    }

    public function loadFromJson($json) {
        $obj = json_decode($json);

        if (!isset($obj->id)) {
            $this->is_valid = false;

            return;
        }

        if ($obj->id === 0) {
            return;
        }

        $this->is_valid = true;
        $this->loadPropertiesFrom($obj);
        $this->options = [];

        if (isset($obj->options)) {
            foreach($obj->options as $item) {
                $this->options[] = new UserOptions($this->container, $item->id);
            }
        }
    }

    public function loadPropertiesFrom($obj) {
        $this->id = (int) $obj->id;
        $this->security_level = new SecurityLevel((int) $obj->security_level);
        $this->username = $obj->username;
        $this->salt = $obj->salt;
        $this->password_hash = $obj->password_hash;
        $this->email = $obj->email;
        $this->default_board_id = (int) $obj->default_board_id;
    }
}

