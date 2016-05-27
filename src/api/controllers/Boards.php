<?php
use RedBeanPHP\R;

class Boards extends BaseController {

    public function getAllBoards($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $boardBeans = R::findAll('board');

        if (count($boardBeans)) {
            $this->apiJson->setSuccess();

            foreach($boardBeans as $bean) {
                // TODO: Filter boards to those where the user is a member
                $board = new Board($this->container);
                $board->loadFromBean($bean);

                $this->apiJson->addData($board);
            }
        } else {
            $this->logger->addInfo('No boards in database.');
            $this->apiJson->addAlert('info', 'No boards in database.');
        }

        return $this->jsonResponse($response);
    }

    public function getBoard($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $board = new Board($this->container, (int)$args['id']);
        // TODO: Filter boards to those where the user is a member

        if ($board->id === 0) {
            $this->logger->addError('Attempt to load board ' . $args['id'] .
                ' failed.');
            $this->apiJson->addAlert('error', 'No board found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($board);

        return $this->jsonResponse($response);
    }

    public function addBoard($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::Admin);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $board = new Board($this->container);
        $board->loadFromJson($request->getBody());

        if (!$board->save()) {
            $this->logger->addError('Add Board: ', [$board]);
            $this->apiJson->addAlert('error', 'Error adding board. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' added board ' . $board->name . '.',
            '', json_encode($board), 'board', $board->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Board ' . $board->name . ' added.');

        return $this->jsonResponse($response);
    }

    public function updateBoard($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::BoardAdmin);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $board = new Board($this->container, (int)$args['id']);
        // TODO: Filter boards to those where the user is a member

        $update = new Board($this->container);
        $update->loadFromJson($request->getBody());

        if ($board->id !== $update->id) {
            $this->logger->addError('Update Board: ', [$board, $update]);
            $this->apiJson->addAlert('error', 'Error updating board. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $update->save();

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' updated board ' . $update->name,
            json_encode($board), json_encode($update),
            'board', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Board ' . $update->name . ' updated.');

        return $this->jsonResponse($response);
    }

    public function removeBoard($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::Admin);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $id = (int)$args['id'];
        $board = new Board($this->container, $id);

        if ($board->id !== $id) {
            $this->logger->addError('Remove Board: ', [$board]);
            $this->apiJson->addAlert('error', 'Error removing board. ' .
                'No board found for ID ' . $id  . '.');

            return $this->jsonResponse($response);
        }

        $before = $board;
        $board->delete();

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' removed board ' . $before->name,
            json_encode($before), '', 'board', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Board ' . $before->name . ' removed.');

        return $this->jsonResponse($response);
    }

}

