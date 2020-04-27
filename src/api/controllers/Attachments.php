<?php
use RedBeanPHP\R;

class Attachments extends BaseController {

  public function getAttachment($request, $response, $args) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $attachment = R::load('attachment', (int)$args['id']);

    if ($attachment->id === 0) {
      $this->logger->error('Attempt to load attachment ' .
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
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    if (!file_exists('uploads/')) {
      mkdir('uploads', 0777, true);
    }

    $body = $request->getBody();
    $attachment = R::dispense('attachment');

    if (!BeanLoader::LoadAttachment($attachment, $body)) {
      $attachment->task_id = 0;
    }

    $task = R::load('task', $attachment->task_id);

    if ($task->id === 0) {
      $this->logger->error('Add Attachment: ', [$attachment]);
      $this->apiJson->addAlert('error', 'Error adding attachment. ' .
        'Please try again.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($this->getBoardId($task->id), $request)) {
      return $this->jsonResponse($response, 403);
    }

    $body = json_decode($body);
    $attachment->diskfilename = sha1($body->filename);

    file_put_contents('uploads/' . $attachment->diskfilename, $body->data);

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
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
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
      $this->logger->error('Remove Attachment: ', [$attachment]);
      $this->apiJson->addAlert('error', 'Error removing attachment. ' .
        'No attachment found for ID ' . $id . '.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($this->getBoardId($attachment->task_id),
      $request)) {
      return $this->jsonResponse($response, 403);
    }

    $before = $attachment;
    R::trash($attachment);

    unlink('uploads/' . $before->diskfilename);

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

