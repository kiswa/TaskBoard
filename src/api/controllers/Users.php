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
        $data = $this->getAllUsersCleaned($request);
        $this->apiJson->addData($data);

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

        $data = json_decode($request->getBody());
        $user = new User($this->container);

        if (isset($data->username)) {
            $existing = R::findOne('user', 'username = ?', [ $data->username ]);

            if ($existing) {
                $this->apiJson->addAlert('error', 'Username already exists. ' .
                    'Change the username and try again.');

                return $this->jsonResponse($response);
            }
        }

        if (isset($data->password)) {
            $data->password_hash =
                password_hash($data->password, PASSWORD_BCRYPT);
            unset($data->password);
            unset($data->password_verify);
        }
        $user->loadFromJson(json_encode($data));

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
        $this->apiJson->addData($this->getAllUsersCleaned($request));

        return $this->jsonResponse($response);
    }

    public function updateUser($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = new User($this->container, (int)$args['id']);
        $update = new User($this->container);
        $actor = new User($this->container, Auth::GetUserId($request));

        if ($actor->id !== $user->id) {
            if ($actor->security_level->getValue() === SecurityLevel::User) {
                $this->apiJson->addAlert('error', 'Access restricted.');

                return $this->jsonResponse($response, 403);
            }
        }

        $data = json_decode($request->getBody());
        if (isset($data->new_password) && isset($data->old_password)) {
            if (password_verify($data->old_password, $user->password_hash)) {
                $data->password_hash =
                    password_hash($data->new_password, PASSWORD_BCRYPT);
            } else {
                $this->logger->addError('Update User: ', [$user, $update]);
                $this->apiJson->addAlert('error', 'Error updating user. ' .
                    'Incorrect current password.');

                return $this->jsonResponse($response);
            }

            unset($data->new_password);
            unset($data->old_password);
        } else {
            $data->password_hash = $user->password_hash;
        }
        $data->active_token = $user->active_token;

        if (isset($data->password)) {
            $data->password_hash =
                password_hash($data->password, PASSWORD_BCRYPT);
            unset($data->password);
        }

        $update->loadFromJson(json_encode($data));

        if ($user->id !== $update->id) {
            $this->logger->addError('Update User: ', [$user, $update]);
            $this->apiJson->addAlert('error', 'Error updating user. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        if ($user->username !== $update->username) {
            $existing = R::findOne('user', 'username = ?', [ $update->username ]);
            if ($existing !== null) {
                $this->logger->addError('Update User: ', [$user, $update]);
                $this->apiJson->addAlert('error', 'Error updating username. ' .
                    'That username is already taken.');

                return $this->jsonResponse($response);
            }
        }

        if ($user->default_board_id !== $update->default_board_id) {
            $newId = $update->default_board_id;

            if ($newId > 0 && !Auth::HasBoardAccess($this->container, $request,
                    $newId, $user->id)) {
                $board = new Board($this->container, $newId);
                $board->users[] = $user;
                $board->save();
            }
        }

        $update->save();

        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' updated user ' . $update->username,
            json_encode($user), json_encode($update),
            'user', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $update->username . ' updated.');
        $this->apiJson->addData(json_encode($this->cleanUser($update)));

        return $this->jsonResponse($response);
    }

    public function updateUserOptions($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = new User($this->container, (int)$args['id']);
        $actor = new User($this->container, Auth::GetUserId($request));

        if ($actor->id !== $user->id) {
            $this->apiJson->addAlert('error', 'Access restricted.');

            return $this->jsonResponse($response, 403);
        }

        $userOpts = new UserOptions($this->container, $user->user_option_id);
        $update = new UserOptions($this->container);

        $data = $request->getBody();
        $update->loadFromJson($data);

        if ($userOpts->id !== $update->id) {
            $this->logger->addError('Update User Options: ',
                [$userOpts, $update]);
            $this->apiJson->addAlert('error', 'Error updating user options. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $update->save();

        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' updated user options',
            json_encode($userOpts), json_encode($update),
            'user_option', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'User options updated.');
        $this->apiJson->addData(json_encode($update));
        $this->apiJson->addData(json_encode($this->cleanUser($user)));

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
        $this->apiJson->addData($this->getAllUsersCleaned($request));

        return $this->jsonResponse($response);
    }

    private function getAllUsersCleaned($request) {
        $userBeans = R::findAll('user');
        $userId = Auth::GetUserId($request);

        $userIds = $this->getUserIdsByBoardAccess(Auth::GetUserId($request));

        // If a user has no board access, they should still see themselves
        if (count($userIds) === 0) {
            $userIds[] = $userId;
        }

        $actor = new User($this->container, $userId);
        $isAdmin = ($actor->security_level->getValue() === SecurityLevel::Admin);

        $data = [];
        foreach($userBeans as $bean) {
            $user = new User($this->container);
            $user->loadFromBean($bean);

            if (in_array($user->id, $userIds) || $isAdmin) {
                $data[] = $this->cleanUser($user);
            }
        }

        return $data;
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

