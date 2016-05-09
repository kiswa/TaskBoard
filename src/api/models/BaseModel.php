<?php
use RedBeanPHP\R;

abstract class BaseModel {
    protected $logger;
    protected $bean;
    protected $container;

    public function __construct($type, $id, $container) {
        $this->container = $container;

        $this->logger = $this->container->get('logger');
        $this->bean = R::load($type, $id);
    }

    public abstract function updateBean();

    public abstract function loadFromBean($bean);
    public abstract function loadFromJson($json);

    public function getBean() {
        return $this->bean;
    }

    public function save() {
        $this->updateBean();

        try {
            $id = R::store($this->bean);
            $this->loadFromBean($this->bean);
        } catch (Exception $ex) {
            $this->logger->addError('Save Error: ', [
                $this->bean,
                $ex->getMessage(),
                $ex->getTrace()
            ]);

            return false;
        }

        return true;
    }

    public function delete() {
        $this->updateBean();
        R::trash($this->bean);
    }
}

