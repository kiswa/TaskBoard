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
    return $b->timestamp - $a->timestamp;
  }

  private function getTaskActivity($taskId) {
    $logs = [];

    $taskActivity = R::find('activity', 'item_type="task" AND item_id=?',
      [$taskId]);
    $this->addLogItems($logs, $taskActivity);

    $commentActivity = R::find('activity', 'item_type="comment" AND item_id=?',
      [$taskId]);
    $this->addLogItems($logs, $commentActivity);

    $attachmentActivity = R::find('activity', 'item_type="attachment" AND ' .
      'item_id=?', [$taskId]);
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

