<?php
use MyCLabs\Enum\Enum;

class SecurityLevel extends Enum {
    const Admin = 1;
    const BoardAdmin = 2;
    const User = 3;
}

class User extends BaseModel {
    public $id = 0;
    public $security_level;
    public $username = '';
    public $password_hash = '';
    public $email = '';
    public $default_board_id = 0;
    public $user_option_id = 0;
    public $last_login = 0;

    public function __construct($container, $id = 0) {
        parent::__construct('user', $id, $container);

        $this->security_level = new SecurityLevel(SecurityLevel::User);

        $this->loadFromBean($this->bean);
    }

    public function updateBean() {
        $bean = $this->bean;

        $bean->id = $this->id;
        $bean->security_level = $this->security_level->getValue();
        $bean->username = $this->username;
        $bean->password_hash = $this->password_hash;
        $bean->email = $this->email;
        $bean->default_board_id = $this->default_board_id;
        $bean->user_option_id = $this->user_option_id;
        $bean->last_login = $this->last_login;
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

    public function loadPropertiesFrom($obj) {
        try {
            $this->id = (int) $obj->id;
            $this->security_level = new SecurityLevel((int) $obj->security_level);
            $this->username = $obj->username;
            $this->password_hash = $obj->password_hash;
            $this->email = $obj->email;
            $this->default_board_id = (int) $obj->default_board_id;
            $this->user_option_id = (int) $obj->user_option_id;
            $this->last_login = (int) $obj->last_login;
        } catch (Exception $ex) {
            $this->is_valid = false;
        }
    }
}

