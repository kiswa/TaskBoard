<?php
use RedBeanPHP\R;

class Activity extends BaseController {

  public function getActivity($request, $response, $args) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::BOARD_ADMIN);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $activity = [];

    // TODO: More activity types
    if ($args['type'] === 'task') {
      if (!$this->checkBoardAccess($this->getBoardId((int)$args['id']),
        $request)) {
        return $this->jsonResponse($response, 403);
      }

      $activity = $this->getTaskActivity((int)$args['id']);
    }

    $this->apiJson->setSuccess();
    $this->apiJson->addData($activity);

    return $this->jsonResponse($response);
  }

  private function getBoardId($taskId) {
    $task = R::load('task', $taskId);
    $column = R::load('column', $task->column_id);

    return $column->board_id;
  }

  private function sortLogs($a, $b) {
    if ($a->timestamp === $b->timestamp) {
      return 0; // @codeCoverageIgnore
    }

    return $a->timestamp > $b->timestamp ? -1 : 1;
  }

  private function getTaskActivity($taskId) {
    $task = R::load('task', $taskId);
    $logs = [];
    $commentIds = [];
    $attachmentIds = [];

    foreach ($task->ownComment as $comment) {
      $commentIds[] = (int)$comment->id;
    }

    foreach ($task->ownAttachment as $attachment) {
      $attachmentIds[] = (int)$attachment->id;
    }

    $taskActivity = R::find('activity',
      'item_type="task" AND item_id=?',
      [$taskId]);
    $this->addLogItems($logs, $taskActivity);

    $commentActivity =
      R::find('activity', 'item_type="comment" AND '.
      'item_id IN(' . R::genSlots($commentIds) . ')',
      $commentIds);
    $this->addLogItems($logs, $commentActivity);

    $attachmentActivity =
      R::find('activity', 'item_type="attachment" AND '.
      'item_id IN(' . R::genSlots($attachmentIds) . ')',
      $attachmentIds);
    $this->addLogItems($logs, $attachmentActivity);

    usort($logs, array("Activity", "sortLogs"));

    return $logs;
  }

  private function addLogItems(&$logs, $items) {
    foreach ($items as $logItem) {
      $logs[] = (object)array('text'=>$logItem->log_text,
        'timestamp'=>$logItem->timestamp);
    }
  }

}

