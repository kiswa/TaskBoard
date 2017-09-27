<?php
use RedBeanPHP\R;

class Comments extends BaseController {

    public function getComment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $comment = R::load('comment', (int)$args['id']);

        if ($comment->id === 0) {
            $this->logger->addError('Attempt to load comment ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No comment found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $task = R::load('task', $comment->task_id);
        $column = R::load('column', $task->column_id);

        if (!$this->checkBoardAccess($column->board_id, $request)) {
            return $this->jsonResponse($response, 403);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($comment);

        return $this->jsonResponse($response);
    }

    public function addComment($request, $response) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $comment = R::dispense('comment');
        if (!BeanLoader::LoadComment($comment, $request->getBody())) {
            $comment->task_id = 0;
        }

        $task = R::load('task', $comment->task_id);
        if ($task->id === 0) {
            $this->logger->addError('Add Comment: ', [$comment]);
            $this->apiJson->addAlert('error', 'Error adding comment. ' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($this->getBoardId($task->id), $request)) {
            return $this->jsonResponse($response, 403);
        }

        R::store($comment);

        $actor = R::load('user', Auth::GetUserId($request));
        $this->dbLogger->logChange($actor->id,
            $actor->username . ' added comment ' . $comment->id . '.',
            '', json_encode($comment), 'comment', $comment->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Comment added.');

        return $this->jsonResponse($response);
    }

    public function updateComment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $actor = R::load('user', Auth::GetUserId($request));
        $comment = R::load('comment', (int)$args['id']);

        // If User level, only the user that created the comment
        // may update it. If higher level, update is allowed.
        if ((int)$actor->security_level === SecurityLevel::USER) {
            if ($actor->id !== $comment->user_id) {
                $this->apiJson->addAlert('error',
                    'You do not have sufficient permissions ' .
                    'to update this comment.');

                return $this->jsonResponse($response);
            }
        } // @codeCoverageIgnore

        $data = json_decode($request->getBody());
        $update = R::dispense('comment');
        $update->id = BeanLoader::LoadComment($update, json_encode($data))
            ? $comment->id
            : 0;

        if ($comment->id === 0 || ((int)$comment->id !== (int)$update->id)) {
            $this->logger->addError('Update Comment: ', [$comment]);
            $this->apiJson->addAlert('error', 'Error updating comment. ' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess(
                $this->getBoardId($comment->task_id), $request)) {
            return $this->jsonResponse($response, 403);
        }

        R::store($update);

        $this->dbLogger->logChange($actor->id,
            $actor->username . ' updated comment ' . $update->id,
            json_encode($comment), json_encode($update),
            'comment', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Comment updated.');

        $task = R::load('task', $comment->task_id);
        $this->apiJson->addData(R::exportAll($task));

        return $this->jsonResponse($response);
    }

    public function removeComment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::USER);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $actor = R::load('user', Auth::GetUserId($request));

        $id = (int)$args['id'];
        $comment = R::load('comment', $id);

        // If User level, only the user that created the comment
        // may delete it. If higher level, delete is allowed.
        if ((int)$actor->security_level === SecurityLevel::USER) {
            if ($actor->id !== $comment->user_id) {
                $this->apiJson->addAlert('error',
                    'You do not have sufficient permissions ' .
                    'to remove this comment.');

                return $this->jsonResponse($response);
            }
        } // @codeCoverageIgnore

        if ((int)$comment->id !== $id) {
            $this->logger->addError('Remove Comment: ', [$comment]);
            $this->apiJson->addAlert('error', 'Error removing comment. ' .
                'No comment found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess(
                $this->getBoardId($comment->task_id), $request)) {
            return $this->jsonResponse($response, 403);
        }

        $before = $comment;
        R::trash($comment);

        $this->dbLogger->logChange($actor->id,
            $actor->username . ' removed comment ' . $before->id,
            json_encode($before), '', 'comment', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Comment removed.');

        $task = R::load('task', $comment->task_id);
        $this->apiJson->addData(R::exportAll($task));

        return $this->jsonResponse($response);
    }

    private function getBoardId($taskId) {
        $task = R::load('task', $taskId);
        $column = R::load('column', $task->column_id);

        return $column->board_id;
    }
}

