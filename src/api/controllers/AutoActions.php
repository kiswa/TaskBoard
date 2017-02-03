<?php
use RedBeanPHP\R;

class AutoActions extends BaseController {

    public function getAllActions($request, $response) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $autoActions = $this->getAll($request);

        if (!count($autoActions)) {
            $this->logger->addInfo('No automatic actions in database.');
            $this->apiJson->addAlert('info',
                'No automatic actions in database.');
            $this->apiJson->addData([]);

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($autoActions);

        return $this->jsonResponse($response);
    }

    public function addAction($request, $response) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::BOARD_ADMIN);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $action = R::dispense('autoaction');
        if (!BeanLoader::LoadAutoAction($action, $request->getBody())) {
            $action->board_id = 0;
        }

        $board = R::load('board', $action->board_id);

        if ($board->id === 0) {
            $this->logger->addError('Add Action: ', [$action]);
            $this->apiJson->addAlert('error',
                'Error adding automatic action. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($action->board_id, $request)) {
            return $this->jsonResponse($response, 403);
        }

        R::store($action);

        $actor = R::load('user', Auth::GetUserId($request));

        $this->dbLogger->logChange($actor->id,
            $actor->username . ' added automatic action.',
            '', json_encode($action), 'action', $action->id);

        $actions = $this->getAll($request);

        $this->apiJson->setSuccess($actions);
        $this->apiJson->addData($actions);
        $this->apiJson->addAlert('success', 'Automatic action added.');

        return $this->jsonResponse($response);
    }

    public function removeAction($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::BOARD_ADMIN);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $id = (int)$args['id'];
        $action = R::load('autoaction', $id);

        if ((int)$action->id !== $id) {
            $this->logger->addError('Remove Action: ', [$action]);
            $this->apiJson->addAlert('error', 'Error removing action. ' .
                'No action found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($action->board_id, $request)) {
            return $this->jsonResponse($response, 403);
        }

        $before = $action;
        R::trash($action);

        $actor = R::load('user', Auth::GetUserId($request));

        $this->dbLogger->logChange($actor->id,
            $actor->username .' removed action ' . $before['id'] . '.',
            json_encode($before), '', 'action', $id);

        $actions = $this->getAll($request);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($actions);
        $this->apiJson->addAlert('success', 'Automatic action removed.');

        return $this->jsonResponse($response);
    }

    private function getAll($request) {
        $autoActions = R::findAll('autoaction');
        $data = [];

        foreach ($autoActions as $action) {
            if (Auth::HasBoardAccess($request, $action->board_id)) {
                $data[] = $action;
            }
        }

        return $data;
    }
}

