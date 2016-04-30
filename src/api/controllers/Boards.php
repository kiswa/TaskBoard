<?php
use RedBeanPHP\R;

class Boards extends BaseController {

    public function getAllBoards($request, $response, $args) {
        $boardBeans = R::findAll('board');

        if (count($boardBeans)) {
            $this->apiJson->setSuccess();

            foreach($boardBeans as $bean) {
                $this->apiJson->addData(Board::fromBean($this->container, $bean));
            }
        } else {
            $this->logger->addInfo('No boards in database.');
            $this->apiJson->addAlert('info', 'No boards in database.');
        }

        return $this->jsonResponse($response);
    }

    public function getBoard($request, $response, $args) {
        $board = new Board($this->container, (int)$args['id']);

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
        $board = Board::fromJson($this->container, $request->getBody());
        $board->save();

        if ($board->id === 0) {
            $this->logger->addError('Add Board: ', [$board]);
            $this->apiJson->addAlert('error', 'Error adding board. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            ' added board ' . $board->name, '', $board, 'board', $board->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Board ' . $board->name . ' added.');

        return $this->jsonResponse($response);
    }

    public function updateBoard($request, $response, $args) {
        $board = new Board($this->container, (int)$args['id']);
        $update = Board::fromJson($request->getBody());

        if ($board->id !== $update->id) {
            $this->logger->addError('Update Board: ', [$board, $update]);
            $this->apiJson->addAlert('error', 'Error updating board. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $update->save();

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            ' updated board ' . $update->name, $board, $update,
            'board', $board->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Board ' . $update->name . ' updated.');

        return $this->jsonResponse($response);
    }

    public function removeBoard($request, $response, $args) {
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

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            ' removed board ' . $before->name, $before, '', 'board', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Board ' . $before->name . ' removed.');

        return $this->jsonResponse($response);
    }

}

