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

    public function addAction($request, $response, $args) {
        $action = new AutoAction($this->container);
        $action->loadFromJson($request->getBody());

        if (!$action->save()) {
            $this->logger->addError('Add Action: ', [$action]);
            $this->apiJson->addAlert('error',
                'Error adding automatic action. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name added automatic action.',
            '', json_encode($action), 'action', $action->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Automatic action added.');

        return $this->jsonResponse($response);
    }

    public function removeAction($request, $response, $args) {
        $id = (int)$args['id'];
        $action = new AutoAction($this->container, $id);

        if($action->id !== $id) {
            $this->logger->addError('Remove Action: ', [$action]);
            $this->apiJson->addAlert('error', 'Error removing action. ' .
                'No action found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $before = $action;
        $action->delete();

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name removed action ' . $before->id,
            json_encode($before), '', 'action', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Automatic action removed.');

        return $this->jsonResponse($response);
    }
}

