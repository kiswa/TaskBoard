<?php
use RedBeanPHP\R;

class Comments extends BaseController {

    public function getComment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $comment = new Comment($this->container, (int)$args['id']);

        if ($comment->id === 0) {
            $this->logger->addError('Attempt to load comment ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No comment found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $task = new Task($this->container, $comment->task_id);
        $column = new Column($this->container, $task->column_id);

        if (!$this->checkBoardAccess($column->board_id, $request)) {
            return $this->jsonResponse($response, 403);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($comment);

        return $this->jsonResponse($response);
    }

    public function addComment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $comment = new Comment($this->container);
        $comment->loadFromJson($request->getBody());

        $task = new Task($this->container, $comment->task_id);

        if ($task->id === 0) {
            $this->logger->addError('Add Comment: ', [$comment]);
            $this->apiJson->addAlert('error', 'Error adding comment. ' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($this->getBoardId($task->id), $request)) {
            return $this->jsonResponse($response, 403);
        }

        $comment->save();

        $actor = new User($this->container, Auth::GetUserId($request));

        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' added comment ' . $comment->id . '.',
            '', json_encode($comment), 'comment', $comment->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Comment added.');

        return $this->jsonResponse($response);
    }

    public function updateComment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $actor = new User($this->container, Auth::GetUserId($request));

        $id = (int)$args['id'];
        $comment = new Comment($this->container, $id);

        // If User level, only the user that created the comment
        // may update it. If higher level, update is allowed.
        if ($actor->security_level->getValue() === SecurityLevel::User) {
            if ($actor->id !== $comment->user_id) {
                $this->apiJson->addAlert('error',
                    'You do not have sufficient permissions ' .
                    'to update this comment.');

                return $this->jsonResponse($response);
            }
        } // @codeCoverageIgnore

        $update = new Comment($this->container);
        $update->loadFromJson($request->getBody());

        if ($comment->id !== $update->id) {
            $this->logger->addError('Update Comment: ', [$comment]);
            $this->apiJson->addAlert('error', 'Error updating comment. ' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($this->getBoardId($comment->task_id),
                $request)) {
            return $this->jsonResponse($response, 403);
        }

        $update->save();

        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' updated comment ' . $update->id,
            json_encode($comment), json_encode($update),
            'comment', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Comment updated.');

        return $this->jsonResponse($response);
    }

    public function removeComment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $actor = new User($this->container, Auth::GetUserId($request));

        $id = (int)$args['id'];
        $comment = new Comment($this->container, $id);

        // If User level, only the user that created the comment
        // may delete it. If higher level, delete is allowed.
        if ($actor->security_level->getValue() === SecurityLevel::User) {
            if ($actor->id !== $comment->user_id) {
                $this->apiJson->addAlert('error',
                    'You do not have sufficient permissions ' .
                    'to remove this comment.');

                return $this->jsonResponse($response);
            }
        } // @codeCoverageIgnore

        if ($comment->id !== $id) {
            $this->logger->addError('Remove Comment: ', [$comment]);
            $this->apiJson->addAlert('error', 'Error removing comment. ' .
                'No comment found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($this->getBoardId($comment->task_id),
                $request)) {
            return $this->jsonResponse($response, 403);
        }

        $before = $comment;
        $comment->delete();

        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username . ' removed comment ' . $before->id,
            json_encode($before), '', 'comment', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Comment removed.');

        return $this->jsonResponse($response);
    }

    private function getBoardId($taskId) {
        $task = new Task($this->container, $taskId);

        $column = new Column($this->container, $task->column_id);

        return $column->board_id;
    }
}

