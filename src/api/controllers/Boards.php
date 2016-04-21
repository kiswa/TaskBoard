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

}

