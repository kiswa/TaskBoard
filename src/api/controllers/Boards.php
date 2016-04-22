<?php
use RedBeanPHP\R;

class Boards extends BaseController {

    public function getAllBoards($request, $response, $args) {
        $boardBeans = R::findAll('board');

        if (count($boardBeans)) {
            $this->apiJson->setSuccess();

            foreach($boardBeans as $bean) {
                $this->apiJson->addData(Board::fromBean($bean));
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
    }

    public function updateBoard($request, $response, $args) {
    }

    public function removeBoard($request, $response, $args) {
    }

}

