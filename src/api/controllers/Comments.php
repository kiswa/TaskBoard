<?php
use RedBeanPHP\R;

class Comments extends BaseController {

  public function getComment($request, $response, $args) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $comment = R::load('comment', (int)$args['id']);

    if ($comment->id === 0) {
      $this->logger->error('Attempt to load comment ' .
        $args['id'] . ' failed.');
      $this->apiJson->addAlert('error', $this->strings->api_noCommentId .
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
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $comment = R::dispense('comment');
    if (!BeanLoader::LoadComment($comment, $request->getBody())) {
      $comment->task_id = 0;
    }

    $task = R::load('task', $comment->task_id);
    if ($task->id === 0) {
      $this->logger->error('Add Comment: ', [$comment]);
      $this->apiJson->addAlert('error', $this->strings->api_commentError);

      return $this->jsonResponse($response);
    }

    $boardId = $this->getBoardId($task->id);

    if (!$this->checkBoardAccess($boardId, $request)) {
      return $this->jsonResponse($response, 403);
    }

    R::store($comment);

    $actor = R::load('user', Auth::GetUserId($request));
    $this->dbLogger->logChange($actor->id,
      $actor->username . ' added comment ' . $comment->id . '.',
      '', json_encode($comment), 'comment', $comment->task_id);

    $this->apiJson->setSuccess();
    $this->apiJson->addData(R::exportAll($task));
    $this->apiJson->addAlert('success', $this->strings->api_commentAdded);

    $board = R::load('board', $boardId);
    $this->sendEmail($board, $task, $comment->text, $actor, 'newComment');

    return $this->jsonResponse($response);
  }

  public function updateComment($request, $response, $args) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $data = json_decode($request->getBody());

    if (is_null($args) || !$args['id']) {
      $this->logger->error('Update Comment: ', [$data]);
      $this->apiJson->addAlert('error', $this->strings->api_commentUpdateError);

      return $this->jsonResponse($response);
    }

    $actor = R::load('user', Auth::GetUserId($request));
    $comment = R::load('comment', (int)$args['id']);

    // If User level, only the user that created the comment
    // may update it. If higher level, update is allowed.
    if ((int)$actor->security_level === SecurityLevel::USER) {
      if ($actor->id !== $comment->user_id) {
        $this->apiJson->addAlert('error', $this->strings->api_accessRestricted);

        return $this->jsonResponse($response);
      }
    } // @codeCoverageIgnore

    $update = R::dispense('comment');
    $update->id = BeanLoader::LoadComment($update, json_encode($data))
      ? $comment->id
      : 0;

    if ($comment->id === 0 || ((int)$comment->id !== (int)$update->id)) {
      $this->logger->error('Update Comment: ', [$comment]);
      $this->apiJson->addAlert('error', $this->strings->api_commentUpdateError);

      return $this->jsonResponse($response);
    }

    $boardId = $this->getBoardId($comment->task_id);

    if (!$this->checkBoardAccess($boardId, $request)) {
      return $this->jsonResponse($response, 403);
    }

    R::store($update);

    $this->dbLogger->logChange($actor->id,
      $actor->username . ' updated comment ' . $update->id,
      json_encode($comment), json_encode($update), 'comment', $update->task_id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', $this->strings->api_commentUpdated);

    $task = R::load('task', $comment->task_id);
    $this->apiJson->addData(R::exportAll($task));

    $board = R::load('board', $boardId);
    $this->sendEmail($board, $task, $comment->text, $actor, 'editComment');

    return $this->jsonResponse($response);
  }

  public function removeComment($request, $response, $args) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
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
        $this->apiJson->addAlert('error', $this->strings->api_accessRestricted);

        return $this->jsonResponse($response);
      }
    } // @codeCoverageIgnore

    if ((int)$comment->id !== $id) {
      $this->logger->error('Remove Comment: ', [$comment]);
      $this->apiJson->addAlert('error', $this->strings->api_commentRemoveError .
        $id . '.');

      return $this->jsonResponse($response);
    }

    $boardId = $this->getBoardId($comment->task_id);

    if (!$this->checkBoardAccess($boardId, $request)) {
      return $this->jsonResponse($response, 403);
    }

    $before = $comment;
    R::trash($comment);

    $this->dbLogger->logChange($actor->id,
      $actor->username . ' removed comment ' . $id,
      json_encode($before), '', 'comment', $before->task_id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', $this->strings->api_commentRemoved);

    $task = R::load('task', $comment->task_id);
    $this->apiJson->addData(R::exportAll($task));

    $board = R::load('board', $boardId);
    $this->sendEmail($board, $task, $comment->text, $actor, 'editComment');

    return $this->jsonResponse($response);
  }

  private function getBoardId($taskId) {
    $task = R::load('task', $taskId);
    $column = R::load('column', $task->column_id);

    return $column->board_id;
  }

  private function sendEmail($board, $task, $comment, $actor, $type) {
    $data = new EmailData($board->id);
    $column = R::load('column', $task->column_id);

    $data->comment = $comment ?: '';

    $data->username = $actor->username ?: '';
    $data->boardName = $board->name ?: '';
    $data->type = $type;

    $data->taskName = $task->title ?: '';
    $data->taskDescription = $task->description ?: '';
    $data->taskDueDate = date('F j, Y, g:i:s A', strtotime($task->due_date));

    $data->taskAssignees = '';
    foreach($task->sharedUserList as $assignee) {
      $data->taskAssignees .= $assignee->username ?: '' . ' ';
    }

    $data->taskCategories = '';
    foreach($task->sharedCategoryList as $category) {
      $data->taskCategories .= $category->name ?: '' . ' ';
    }

    $data->taskPoints = $task->points ?: '';
    $data->taskColumnName = $column->name ?: '';
    $data->taskPosition = $task->position ?: '';

    $emails = $this->getAdminEmailAddresses($board->id);
    if($actor->email !== '' && !in_array($actor->email, $emails)) {
      $emails[] = $actor->email; // @codeCoverageIgnore
    }

    $result = $this->mailer->sendMail($emails, $data);
    if ($result !== '') {
      $this->apiJson->addAlert('info', $result); // @codeCoverageIgnore
    }
  }
}

