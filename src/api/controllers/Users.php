<?php
use RedBeanPHP\R;

class Users extends BaseController {

    public function getAllUsers($request, $response, $args) {
        $userBeans = R::findAll('user');

        if (count($userBeans)) {
            $this->apiJson->setSuccess();

            foreach($userBeans as $bean) {
                $user = new User($this->container);
                $user->loadFromBean($bean);

                $this->apiJson->addData($this->cleanUser($user));
            }
        } else {
            $this->logger->addInfo('No users in database.');
            $this->apiJson->addAlert('info', 'No users in database.');
        }

        return $this->jsonResponse($response);
    }

    public function getUser($request, $response, $args) {
        $user = new User($this->container, (int)$args['id']);

        if ($user->id === 0) {
            $this->logger->addError('Attempt to load user ' . $args['id'] .
                ' failed.');
            $this->apiJson->addAlert('error', 'No user found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($this->cleanUser($user));

        return $this->jsonResponse($response);
    }

    public function addUser($request, $response, $args) {
        $user = new User($this->container);
        $user->loadFromJson($request->getBody());

        if (!$user->save()) {
            $this->logger->addError('Add User: ', [$user]);
            $this->apiJson->addAlert('error', 'Error adding user. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name added user ' . $user->username . '.',
            '', json_encode($user), 'user', $user->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $user->username . ' added.');

        return $this->jsonResponse($response);
    }

    public function updateUser($request, $response, $args) {
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

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name updated user ' . $update->username,
            json_encode($user), json_encode($update),
            'user', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $update->username . ' updated.');

        return $this->jsonResponse($response);
    }

    public function removeUser($request, $response, $args) {
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

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name removed user ' . $before->username,
            json_encode($before), '', 'user', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $before->username . ' removed.');

        return $this->jsonResponse($response);
    }

    private function cleanUser($user) {
        $user->security_level = $user->security_level->getValue();
        unset($user->password_hash);
        unset($user->active_token);

        return $user;
    }
}

