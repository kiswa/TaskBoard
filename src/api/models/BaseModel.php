<?php
use RedBeanPHP\R;

abstract class BaseModel {
    protected $logger;
    protected $bean;
    protected $container;
    protected $is_valid = true;

    public function __construct($type, $id, $container) {
        $this->container = $container;

        $this->logger = $this->container->get('logger');
        $this->bean = R::load($type, $id);
    }

    public abstract function updateBean();

    public abstract function loadFromBean($bean);
    public abstract function loadFromJson($json);

    // To make the bean accessible to tests
    public function getBean() {
        return $this->bean;
    }

    public function save() {
        if (!$this->is_valid) {
            return false;
        }

        $this->updateBean();

        try {
            $this->id = R::store($this->bean);

            list($props, $type) = $this->bean->getPropertiesAndType();
            $this->loadFromBean(R::load($type, $this->id));
        } catch (Exception $ex) {
            $this->logger->addError('Save Error: ', [
                $this->bean,
                $ex->getMessage(),
                $ex->getTrace()
            ]);

            return false;   // @codeCoverageIgnore
        }

        return true;
    }

    public function delete() {
        $this->updateBean();
        R::trash($this->bean);
    }

    protected function updateBeanList(&$objList, &$beanList) {
        if (count($objList) === 0) {
            return;
        }

        foreach ($objList as $obj) {
            $obj->updateBean();

            if ($obj->id > 0 && array_key_exists($obj->id, $beanList)) {
                $beanList[$obj->id] = $obj->bean;
            } else {
                $beanList[] = $obj->bean;
            }
        }

        foreach($beanList as $bean) {
            $found = false;

            foreach($objList as $obj) {
                if ($obj->bean->id == $bean->id) {
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                unset($beanList[(int)$bean->id]);
            }
        }
    }

    protected function updateObjList(&$objList, &$beanList, $ctor) {
        // Beans are indexed by id, the object list is zero-based
        $count = 0;
        $objList = [];

        foreach($beanList as $bean) {
            $objList[] = $ctor($bean->id);
            $count++;
        }
    }
}

