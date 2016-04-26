<?php
use RedBeanPHP\R;

abstract class BaseModel {
    protected $logger;
    protected $bean;

    public function __construct($type, $id, $container) {
        $this->logger = $container->get('logger');
        $this->bean = R::load($type, $id);
    }

    public abstract function updateBean();
    public abstract function loadFromBean($container, $bean);
    public abstract function loadFromJson($container, $obj);

    public function save() {
        $this->updateBean();

        try {
            R::store($this->bean);
            $this->loadFromBean($this->bean);
        } catch (Exception $ex) {
            $this->logger->addError('Save Error: ', [$this->bean]);
        }
    }

    public function delete() {
        $this->updateBean();
        R::trash($this->bean);
    }
}

