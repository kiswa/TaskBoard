<?php
use RedBeanPHP\R;

class Dashboard extends BaseController {

  public function getMyBoardInfo($request, $response) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $boards = $this->loadAllBoards($request);

    if (!count($boards)) {
      $this->apiJson->addAlert('info', $this->strings->api_noBoards);

      return $this->jsonResponse($response);
    }

    $this->apiJson->setSuccess();
    $this->apiJson->addData($this->convertBoardData($boards));

    return $this->jsonResponse($response);
  }

  public function getMyTaskInfo($request, $response) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $boards = $this->loadAllBoards($request);

    if (!count($boards)) {
      $this->apiJson->addAlert('info', $this->strings->api_noBoards);

      return $this->jsonResponse($response);
    }

    $this->apiJson->setSuccess();
    $userId = Auth::GetUserId($request);
    $this->apiJson->addData($this->convertTaskData($boards, $userId));

    return $this->jsonResponse($response);
  }

  private function convertBoardData($boards) {
    $retVal = [];

    foreach($boards as $board) {
      if ($board["is_active"] !== '1') {
        continue;
      }

      $retVal[] = (object)array(
        "id" => $board["id"],
        "name" => $board["name"],
        "columns" => [],
        "categories" => []
      );

      $index = count($retVal) - 1;

      foreach($board["ownColumn"] as $column) {
        $retVal[$index]->columns[] = (object)array(
          "name" => $column["name"],
          "tasks" => count($column["ownTask"])
        );
      }

      foreach($board["ownCategory"] as $category) {
        $retVal[$index]->categories[] = (object)array(
          "name" => $category["name"],
          "tasks" => count($category["sharedTask"])
        );
      }
    }

    return $retVal;
  }

  private function convertTaskData($boards, $userId) {
    $retVal = [];

    foreach($boards as $board) {
      foreach($board["ownColumn"] as $column) {
        foreach($column["ownTask"] as $task) {
          $isMine = false;

          foreach($task["sharedUser"] as $assignee) {
            if ($assignee["id"] === (string)$userId) {
              $isMine = true;
            }
          }

          if (!$isMine) {
            continue;
          }

          $attachments = R::exec(
            "SELECT COUNT(id) AS num FROM attachment WHERE task_id = ?",
            [ $task["id"] ]
          );

          $comments = R::exec(
            "SELECT COUNT(id) AS num FROM comment WHERE task_id = ?",
            [ $task["id"] ]
          );

          $retVal[] = (object)array(
            "board" => $board["name"],
            "board_id" => $board["id"],
            "title" => $task["title"],
            "color" => $task["color"],
            "column" => $column["name"],
            "date_due" => $task["due_date"],
            "points" => $task["points"],
            "attachments" => $attachments,
            "comments" => $comments
          );
        }
      }
    }

    return $retVal;
  }

  private function loadAllBoards($request) {
    $boards = [];
    $boardBeans = R::findAll('board');

    if (count($boardBeans)) {
      foreach ($boardBeans as $bean) {
        if (Auth::HasBoardAccess($request, $bean->id)) {
          $this->cleanBoard($bean);
          $boards[] = $bean;
        }
      }
    }

    return R::exportAll($boards);
  }

  private function cleanBoard(&$board) {
    foreach ($board->sharedUserList as $user) {
      $user = $this->cleanUser($user);
    }

    foreach ($board->xownColumnList as $column) {
      foreach ($column->xownTaskList as $task) {
        foreach ($task->sharedUserList as $user) {
          $user = $this->cleanUser($user);
        }
      }
    }
  }

  private function cleanUser($user) {
    unset($user->password_hash);
    unset($user->active_token);

    return $user;
  }

}

