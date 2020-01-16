<?php
use RedBeanPHP\R;

class Attachments extends BaseController {

  public function getAttachment($request, $response, $args) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $attachment = R::load('attachment', (int)$args['id']);

    if ($attachment->id === 0) {
      $this->logger->addError('Attempt to load attachment ' .
        $args['id'] . ' failed.');
      $this->apiJson->addAlert('error', 'No attachment found for ID ' .
        $args['id'] . '.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($this->getBoardId($attachment->task_id),
      $request)) {
      return $this->jsonResponse($response, 403);
    }

    $this->apiJson->setSuccess();
    $this->apiJson->addData($attachment);

    return $this->jsonResponse($response);
  }

  public function addAttachment($request, $response) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $attachment = R::dispense('attachment');
    if (!BeanLoader::LoadAttachment($attachment, $request->getBody())) {
      $attachment->task_id = 0;
    }

    $task = R::load('task', $attachment->task_id);

    if ($task->id === 0) {
      $this->logger->addError('Add Attachment: ', [$attachment]);
      $this->apiJson->addAlert('error', 'Error adding attachment. ' .
        'Please try again.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($this->getBoardId($task->id), $request)) {
      return $this->jsonResponse($response, 403);
    }

    R::store($attachment);

    $actor = R::load('user', Auth::GetUserId($request));

    $this->dbLogger->logChange($actor->id,
      $actor->username . ' added attachment.', '', json_encode($attachment),
      'attachment', $attachment->id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', 'Attachment added.');

    return $this->jsonResponse($response);
  }

  public function removeAttachment($request, $response, $args) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $actor = R::load('user', Auth::GetUserId($request));

    $id = (int)$args['id'];
    $attachment = R::load('attachment', $id);

    // If User level, only the user that created the attachment
    // may delete it. If higher level, delete is allowed.
    if ((int)$actor->security_level === SecurityLevel::USER) {
      if ($actor->id !== $attachment->user_id) {
        $this->apiJson->addAlert('error',
          'You do not have sufficient permissions ' .
          'to remove this attachment.');

        return $this->jsonResponse($response);
      }
    } // @codeCoverageIgnore

    if ((int)$attachment->id !== $id) {
      $this->logger->addError('Remove Attachment: ', [$attachment]);
      $this->apiJson->addAlert('error', 'Error removing attachment. ' .
        'No attachment found for ID ' . $id . '.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($this->getBoardId($attachment->task_id),
      $request)) {
      return $this->jsonResponse($response, 403);
    }

    $before = $attachment;
    $attachment->delete();

    $this->dbLogger->logChange($actor->id,
      $actor->username .' removed attachment ' . $before->name,
      json_encode($before), '', 'attachment', $id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success',
      'Attachment ' . $before->name . ' removed.');

    return $this->jsonResponse($response);
  }

  private function getBoardId($taskId) {
    $task = R::load('task', $taskId);
    $column = R::load('column', $task->column_id);

    return $column->board_id;
  }
}

