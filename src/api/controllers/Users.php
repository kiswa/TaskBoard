<?php
use RedBeanPHP\R;

class Users extends BaseController {

    public function getAllUsers($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $this->apiJson->setSuccess();
        $userBeans = R::findAll('user');

        $userIds = $this->getUserIdsByBoardAccess(Auth::GetUserId($request));

        foreach($userBeans as $bean) {
            $user = new User($this->container);
            $user->loadFromBean($bean);

            if (in_array($user->id, $userIds)) {
                $this->apiJson->addData($this->cleanUser($user));
            }
        }

        return $this->jsonResponse($response);
    }

    public function getUser($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $id = (int)$args['id'];

        $userIds = $this->getUserIdsByBoardAccess(Auth::GetUserId($request));
        $user = new User($this->container, $id);

        if ($user->id === 0) {
            $this->logger->addError('Attempt to load user ' . $id .
                ' failed.');
            $this->apiJson->addAlert('error', 'No user found for ID ' .
                $id . '.');

            return $this->jsonResponse($response);
        }

        if (!in_array($id, $userIds)) {
            $this->apiJson->addAlert('error', 'Access restricted.');

            return $this->jsonResponse($response, 403);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($this->cleanUser($user));

        return $this->jsonResponse($response);
    }

    public function addUser($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::Admin);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = new User($this->container);
        $user->loadFromJson($request->getBody());

        if (!$user->save()) {
            $this->logger->addError('Add User: ', [$user]);
            $this->apiJson->addAlert('error', 'Error adding user. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
             $actor->username . ' added user ' . $user->username . '.',
            '', json_encode($user), 'user', $user->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $user->username . ' added.');

        return $this->jsonResponse($response);
    }

    public function updateUser($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::Admin);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = new User($this->container, (int)$args['id']);

        $update = new User($this->container);
        $update->loadFromJson($request->getBody());

        if ($user->id !== $update->id) {
            $this->logger->addError('Update User: ', [$user, $update]);
            $this->apiJson->addAlert('error', 'Error updating user. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $update->save();

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' updated user ' . $update->username,
            json_encode($user), json_encode($update),
            'user', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $update->username . ' updated.');

        return $this->jsonResponse($response);
    }

    public function removeUser($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::Admin);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $id = (int)$args['id'];
        $user = new User($this->container, $id);

        if ($user->id !== $id) {
            $this->logger->addError('Remove User: ', [$user]);
            $this->apiJson->addAlert('error', 'Error removing user. ' .
                'No user found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $before = $user;
        $user->delete();

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' removed user ' . $before->username,
            json_encode($before), '', 'user', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $before->username . ' removed.');

        return $this->jsonResponse($response);
    }

    private function getUserIdsByBoardAccess($userId) {
        $userIds = [];

        $boardIds = R::getAll('SELECT board_id FROM board_user ' .
            'WHERE user_id = :user_id',
            [':user_id' => $userId]);

        foreach($boardIds as $id) {
            $board = R::load('board', (int) $id['board_id']);

            foreach($board->sharedUserList as $user) {
                if (!in_array((int) $user->id, $userIds)) {
                    $userIds[] = (int) $user->id;
                }
            }
        }

        return $userIds;
    }

    private function cleanUser($user) {
        $user->security_level = $user->security_level->getValue();
        unset($user->password_hash);
        unset($user->active_token);

        return $user;
    }
}

