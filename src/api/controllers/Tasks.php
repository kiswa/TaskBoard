<?php
use RedBeanPHP\R;

class Tasks extends BaseController {

    public function getTask($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $task = new Task($this->container, (int)$args['id']);

        if ($task->id === 0) {
            $this->logger->addError('Attemt to load task ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No task found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($task);

        return $this->jsonResponse($response);
    }

    public function addTask($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $task = new Task($this->container);
        $task->loadFromJson($request->getBody());

        if (!$task->save()) {
            $this->logger->addError('Add Task: ', [$task]);
            $this->apiJson->addAlert('error', 'Error adding task. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' added task ' . $task->title . '.',
            '', json_encode($task), 'task', $task->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Task ' .
            $task->title . ' added.');

        return $this->jsonResponse($response);
    }

    public function updateTask($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $task = new Task($this->container, (int)$args['id']);
        $update = new Task($this->container);
        $update->loadFromJson($request->getBody());

        if ($task->id !== $update->id) {
            $this->logger->addError('Update Task: ', [$task, $update]);
            $this->apiJson->addAlert('error', 'Error updating task ' .
                $task->title . '. Please try again.');

            return $this->jsonResponse($response);
        }

        $update->save();

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name updated task ' . $task->title,
            json_encode($task), json_encode($update),
            'task', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Task ' .
            $update->title . ' updated.');

        return $this->jsonResponse($response);
    }

    public function removeTask($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $id = (int)$args['id'];
        $task = new Task($this->container, $id);

        if ($task->id !== $id) {
            $this->logger->addError('Remove Task: ', [$task]);
            $this->apiJson->addAlert('error', 'Error removing task. ' .
                'No task found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $before = $task;
        $task->delete();

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' removed task ' . $before->title,
            json_encode($before), '', 'task', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Task ' . $before->title . ' removed.');

        return $this->jsonResponse($response);
    }
}

