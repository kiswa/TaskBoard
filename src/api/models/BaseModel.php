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
            $id = R::store($this->bean);
            $this->loadFromBean($this->bean);
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

        foreach($beanList as $bean) {
            if (array_key_exists($count, $objList)) {
                $objList[$count]->bean = $bean;
                $objList[$count]->loadFromBean($bean);
            } else {
                $objList[] = $ctor($bean->id);
            }
            $count++;
        }

        // Remove extra objects
        $len = count($objList);
        if ($len > $count) {
            for (; $count < $len; $count++) {
                unset($objList[$count]);
            }
        }
    }
}

