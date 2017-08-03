<?php
use RedBeanPHP\R;

class Tasks extends BaseController {

    public function getTask($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $task = R::load('task', (int)$args['id']);

        if ((int)$task->id === 0) {
            $this->logger->addError('Attemt to load task ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No task found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess(
                $this->getBoardId($task->column_id), $request)) {
            return $this->jsonResponse($response, 403);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($task);

        return $this->jsonResponse($response);
    }

    public function addTask($request, $response) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $task = R::dispense('task');
        BeanLoader::LoadTask($task, $request->getBody());

        $column = R::load('column', $task->column_id);

        if ((int)$column->id === 0) {
            $this->logger->addError('Add Task: ', [$task]);
            $this->apiJson->addAlert('error', 'Error adding task. ' .
                'Please check your entries and try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($column->board_id, $request)) {
            return $this->jsonResponse($response, 403);
        }

        R::store($task);

        $actor = R::load('user', Auth::GetUserId($request));
        $this->updateTaskOrder($task, $actor);

        $this->dbLogger->logChange($actor->id,
            $actor->username . ' added task ' . $task->title . '.',
            '', json_encode($task), 'task', $task->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Task ' .
            $task->title . ' added.');
        $this->apiJson->addData(R::exportAll($task));

        $board = R::load('board', $column->board_id);
        $this->apiJson->addData(R::exportAll($board));

        return $this->jsonResponse($response);
    }

    public function updateTask($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $task = R::load('task', (int)$args['id']);

        $update = R::load('task', (int)$args['id']);
        $update->id = BeanLoader::LoadTask($update, $request->getBody())
            ? $task->id
            : 0;

        if ($task->id === 0 || ((int)$task->id !== (int)$update->id)) {
            $this->logger->addError('Update Task: ', [$task, $update]);
            $this->apiJson->addAlert('error', 'Error updating task ' .
                $task->title . '. Please try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess(
                $this->getBoardId($task->column_id), $request)) {
            return $this->jsonResponse($response, 403);
        }

        R::store($update);

        $actor = R::load('user', Auth::GetUserId($request));
        $this->dbLogger->logChange($actor->id,
            $actor->username . ' updated task ' . $task->title,
            json_encode($task), json_encode($update),
            'task', $update->id);

        $boardId = $this->getBoardId($task->column_id);
        $board = R::load('board', $boardId);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Task ' .
            $update->title . ' updated.');
        $this->apiJson->addData(R::exportAll($update));
        $this->apiJson->addData(R::exportAll($board));

        return $this->jsonResponse($response);
    }

    public function removeTask($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $id = (int)$args['id'];
        $task = R::load('task', $id);

        if ((int)$task->id !== $id || (int)$task->id === 0) {
            $this->logger->addError('Remove Task: ', [$task]);
            $this->apiJson->addAlert('error', 'Error removing task. ' .
                'No task found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $boardId = $this->getBoardId($task->column_id);

        if (!$this->checkBoardAccess($boardId, $request)) {
            return $this->jsonResponse($response, 403);
        }

        $before = $task;
        R::trash($task);

        $actor = R::load('user', Auth::GetUserId($request));
        $this->dbLogger->logChange($actor->id,
            $actor->username . ' removed task ' . $before->title,
            json_encode($before), '', 'task', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Task ' . $before->title . ' removed.');

        $board = R::load('board', $boardId);
        $this->apiJson->addData(R::exportAll($board));

        return $this->jsonResponse($response);
    }

    private function getBoardId($columnId) {
        $column = R::load('column', $columnId);

        return $column->board_id;
    }

    private function updateTaskOrder($task, $user) {
        $column = R::load('column', $task->column_id);
        $user_opts = R::load('useroption', $user->user_option_id);

        $index = count($column->xownTaskList);
        $newTask = $column->xownTaskList[$index];

        if ($user_opts->new_tasks_at_bottom) {
            $newTask->position = $index;
            R::store($newTask);
            return;
        }

        for ($i = count($column->xownTaskList); $i > 0; --$i) {
            $updateTask = $column->xownTaskList[$i];
            $updateTask->position = $i;

            R::store($column);
        }
    }
}

