<?php
use RedBeanPHP\R;

class Boards extends BaseController {

    public function getAllBoards($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $boards = $this->loadAllBoards($request);

        if (count($boards)) {
            $this->apiJson->setSuccess();
            $this->apiJson->addData($boards);
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

        if ($board->id === 0) {
            $this->logger->addError('Attempt to load board ' . $args['id'] .
                ' failed.');
            $this->apiJson->addAlert('error', 'No board found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($board->id, $request)) {
            return $this->jsonResponse($response, 403);
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

        $this->includeAdmins($board);

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
        $this->apiJson->addData($this->loadAllBoards($request));

        return $this->jsonResponse($response);
    }

    public function updateBoard($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::BoardAdmin);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $data = json_decode($request->getBody());
        $board = new Board($this->container, (int)$args['id']);

        if (!$this->checkBoardAccess($board->id, $request)) {
            return $this->jsonResponse($response, 403);
        }

        if (!property_exists($data, 'id')) {
            $this->logger->addError('Update Board: ', [$board, $data]);
            $this->apiJson->addAlert('error', 'Error updating board. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $update = new Board($this->container, (int)$args['id']);
        $update->loadFromJson($request->getBody());

        if ($board->id !== $update->id) {
            $this->logger->addError('Update Board: ', [$board, $update]);
            $this->apiJson->addAlert('error', 'Error updating board. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $this->includeAdmins($update);
        $update->save();

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' updated board ' . $update->name,
            json_encode($board), json_encode($update),
            'board', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Board ' . $update->name . ' updated.');
        $this->apiJson->addData($this->loadAllBoards($request));

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
        $this->apiJson->addData($this->loadAllBoards($request));

        return $this->jsonResponse($response);
    }

    private function includeAdmins($board) {
        $admins = R::findAll('user', ' WHERE security_level = 1 ');

        foreach($admins as $admin) {
            $user = new User($this->container, $admin->id);

            if (!in_array($user, $board->users)) {
                $board->users[] = $user;
            }
        }
    }

    private function loadAllBoards($request) {
        $boards = [];
        $boardBeans = R::findAll('board');

        if (count($boardBeans)) {
            foreach($boardBeans as $bean) {
                $board = new Board($this->container);
                $board->loadFromBean($bean);

                if (Auth::HasBoardAccess($this->container,
                        $request, $board->id)) {
                    foreach($board->users as $user) {
                        $user = $this->cleanUser($user);
                    }

                    $boards[] = $board;
                }
            }
        }

        return $boards;
    }

    private function cleanUser($user) {
        $user->security_level = $user->security_level->getValue();
        unset($user->password_hash);
        unset($user->active_token);

        return $user;
    }
}

