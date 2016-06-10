<?php
use RedBeanPHP\R;

class Attachments extends BaseController {

    public function getAttachment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $attachment = new Attachment($this->container, (int)$args['id']);

        if (!$this->checkBoardAccess($this->getBoardId($attachment->task_id),
                $request)) {
            return $this->jsonResponse($response, 403);
        }

        if ($attachment->id === 0) {
            $this->logger->addError('Attempt to load attachment ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No attachment found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($attachment);

        return $this->jsonResponse($response);
    }

    public function addAttachment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $attachment = new Attachment($this->container);
        $attachment->loadFromJson($request->getBody());

        $task = new Task($this->container, $attachment->task_id);

        if ($task->id === 0) {
            $this->logger->addError('Add Attachment: ', [$attachment]);
            $this->apiJson->addAlert('error', 'Error adding attachment. ' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        if (!$this->checkBoardAccess($this->getBoardId($task->id), $request)) {
            return $this->jsonResponse($response, 403);
        }

        $attachment->save();

        $actor = new User($this->container, Auth::GetUserId($request));

        $this->dbLogger->logChange($this->container, 0,
            '$user->name added attachment.', '', json_encode($attachment),
            'attachment', $attachment->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Attachment added.');

        return $this->jsonResponse($response);
    }

    public function removeAttachment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $actor = new User($this->container, Auth::GetUserId($request));

        $id = (int)$args['id'];
        $attachment = new Attachment($this->container, $id);

        // If User level, only the user that created the attachment
        // may delete it. If higher level, delete is allowed.
        if ($actor->security_level->getValue() === SecurityLevel::User) {
            if ($actor->id !== $attachment->user_id) {
                $this->apiJson->addAlert('error',
                    'You do not have sufficient permissions ' .
                    'to remove this attachment.');

                return $this->jsonResponse($response);
            }
        } // @codeCoverageIgnore

        if (!$this->checkBoardAccess($this->getBoardId($attachment->task_id),
                $request)) {
            return $this->jsonResponse($response, 403);
        }

        if ($attachment->id !== $id) {
            $this->logger->addError('Remove Attachment: ', [$attachment]);
            $this->apiJson->addAlert('error', 'Error removing attachment. ' .
                'No attachment found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $before = $attachment;
        $attachment->delete();

        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username .' removed attachment ' . $before->name,
            json_encode($before), '', 'attachment', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Attachment ' . $before->name . ' removed.');

        return $this->jsonResponse($response);
    }

    private function getBoardId($taskId) {
        $task = new Task($this->container, $taskId);

        if ($task->id === 0) {
            return 0;
        }

        $column = new Column($this->container, $task->column_id);

        return $column->board_id;
    }
}

