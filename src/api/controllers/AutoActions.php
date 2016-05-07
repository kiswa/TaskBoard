<?php
use RedBeanPHP\R;

class AutoActions extends BaseController {

    public function getAllActions($request, $response, $args) {
        $actionBeans = R::findAll('auto_action');

        if(count($actionBeans)) {
            $this->apiJson->setSuccess();

            foreach($actionBeans as $bean) {
                $this->apiJson->addData(
                    AutoAction::fromBean($this->container, $bean));
            }
        } else {
            $this->logger->addInfo('No automatic actions in database.');
            $this->apiJson->addAlert('info',
                'No automatic actions in database.');
        }

        return $this->jsonResponse($response);
    }
}

