<?php
use RedBeanPHP\R;

abstract class BaseModel {
    protected $logger;
    protected $bean;

    public function __construct($type, $id) {
        global $app;
        $container = $app->getContainer();

        $this->logger = $container->get('logger');
        $this->bean = R::load($type, $id);
    }

    public abstract function updateBean();
    public abstract function loadFromBean($bean);

    public function save() {
        $this->updateBean();
        R::store($this->bean);
        $this->loadFromBean($this->bean);
    }

    public function delete() {
        $this->updateBean();
        R::trash($this->bean);
    }
}

