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
        $this->updateTaskOrder($task, $actor, true);
        $this->checkAutomaticActions(null, $task);

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

        $before = R::exportAll($task);
        R::store($update);
        $after= R::exportAll($update);

        $actor = R::load('user', Auth::GetUserId($request));

        $this->updateTaskOrder($update, $actor, false);
        $this->checkAutomaticActions($before, $after);
        $update = R::load('task', $update->id);

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
        $this->updateTaskOrder($task, $actor, false);

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

    private function sortTasks($a, $b) {
        return strcmp($a->position, $b->position);
    }

    private function updateTaskOrder($task, $user, $isNew) {
        $column = R::load('column', $task->column_id);
        $user_opts = R::load('useroption', $user->user_option_id);

        usort($column->xownTaskList, array($this, 'sortTasks'));

        $counter = 1;
        foreach ($column->xownTaskList as $task) {
            $task->position = $counter;
            $counter++;
        }

        R::store($column);

        if (!$isNew || $user_opts->new_tasks_at_bottom) {
            return;
        }

        $lastTask = end($column->xownTaskList);
        $lastTask->position = 0;
        R::store($column);
    }

    private function checkAutomaticActions($before, $after) {
        $boardId = $this->getBoardId($after[0]['column_id']);
        $autoActions = R::find('autoaction', ' board_id = ? ', [ $boardId ]);

        foreach ($autoActions as $action) {
            switch ($action->trigger) {
                case ActionTrigger::MOVED_TO_COLUMN():
                    if ($before[0]['column_id'] !== $after[0]['column_id'] &&
                        $after[0]['column_id'] === (int)$action->source_id) {
                        $this->alterTask($action, $after[0]['id']);
                    }
                    break;
                case ActionTrigger::ASSIGNED_TO_USER():
                    $prevAssigned = $this->isInList($action->source_id,
                                                    isset($before[0]['sharedUser']) ?
                                                    $before[0]['sharedUser'] :
                                                    []);

                    if ($prevAssigned) {
                        break;
                    }

                    foreach ($after[0]['sharedUser'] as $user) {
                        if ((int)$action->source_id === (int)$user['id']) {
                            $this->alterTask($action, $after[0]['id']);
                        }
                    }
                    break;
                case ActionTrigger::ADDED_TO_CATEGORY():
                    $prevAssigned = $this->isInList($action->source_id,
                                                    isset($before[0]['sharedCategory']) ?
                                                    $before[0]['sharedCategory'] :
                                                    []);
                    if ($prevAssigned) {
                        break;
                    }

                    foreach ($after[0]['sharedCategory'] as $category) {
                        if ((int)$action->source_id === (int)$category['id']) {
                            $this->alterTask($action, $after[0]['id']);
                        }
                    }

                    break;
                case ActionTrigger::POINTS_CHANGED():
                     $points = (isset($before[0]['points'])) ?
                        (int)$before[0]['points'] :
                        0;

                    if ($points !== (int)$after[0]['points']) {
                        $this->updateTaskColor($after[0]['id'],
                                               $points,
                                               $after[0]['points']);
                    }
                    break;
            }
        }
    }

    private function isInList($itemId, $list) {
        foreach ($list as $item) {
            if ((int)$item['id'] === (int)$itemId) {
                return true;
            }
        }

        return false;
    }

    private function alterTask($action, $taskId) {
        switch ($action->type) {
            case ActionType::SET_COLOR():
                $task = R::load('task', $taskId);
                $task->color = $action->change_to;
                $this->apiJson->addAlert('info',
                                         'Task color changed by automatic action.');
                R::store($task);
                break;

            case ActionType::SET_CATEGORY():
                $task = R::load('task', $taskId);
                unset($task->sharedCategoryList);
            case ActionType::ADD_CATEGORY():
                if (!isset($task)) {
                    $task = R::load('task', $taskId);
                }

                $cat = R::load('category', $action->change_to);
                $task->sharedCategoryList[] = $cat;
                $this->apiJson->addAlert('info',
                                         'Task categories changed by automatic action.');
                R::store($task);
                break;

            case ActionType::SET_ASSIGNEE():
                $task = R::load('task', $taskId);
                unset($task->sharedUserList);
            case ActionType::ADD_ASSIGNEE():
                if (!isset($task)) {
                    $task = R::load('task', $taskId);
                }

                $user = R::load('user', $action->change_to);
                $task->sharedUserList[] = $user;
                $this->apiJson->addAlert('info',
                                         'Task assignees changed by automatic action.');
                R::store($task);
                break;

            case ActionType::CLEAR_DUE_DATE():
                $task = R::load('task', $taskId);

                if ($task->due_date === '') {
                    break;
                }

                $task->due_date = '';
                $this->apiJson->addAlert('info',
                                         'Task due date cleared by automatic action.');
                R::store($task);
                break;
        }
    }

    private function updateTaskColor($taskId, $beforePoints, $afterPoints)  {
        $task = R::load('task', $taskId);
        $diff = (float)$beforePoints - (float)$afterPoints;

        // Steps should be between -255 and 255.
        // Negative = darker, positive = lighter
        $steps = max(-255, min(255, $diff * 10));

        // Normalize into a six character long hex string
        $hex = $task->color;
        $hex = str_replace('#', '', $hex);
        if (strlen($hex) == 3) {
            $hex = str_repeat(substr($hex, 0, 1), 2).
                str_repeat(substr($hex, 1, 1), 2).
                str_repeat(substr($hex, 2, 1), 2);
        }

        // Split into three parts: R, G and B
        $colorParts = str_split($hex, 2);
        $newColor = '#';

        foreach ($colorParts as $color) {
            // Convert to decimal
            $color = hexdec($color);
            // Adjust color
            $color = max(0, min(255, $color + $steps));
            // Make two char hex code
            $newColor .= str_pad(dechex($color), 2, '0', STR_PAD_LEFT);
        }

        $task->color = $newColor;

        $this->apiJson->addAlert('info',
                                 'Task color changed by automatic action.');
        R::store($task);
    }
}

