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

    public function __construct($container, $id = 0, $internal = false) {
        parent::__construct('user', $id, $container);

        if ($internal) {
            return;
        }

        $this->loadFromBean($this->bean);
    }

    public static function fromBean($container, $bean) {
        $instance = new self($container, 0, true);
        $instance->loadFromBean($bean);

        return $instance;
    }

    public static function fromJson($container, $json) {
        $instance = new self($container, 0, true);
        $instance->loadFromJson($json);

        return $instance;
    }

    public function updateBean() {
    }

    public function loadFromBean($bean) {
    }

    public function loadFromJson($obj) {
    }
}

