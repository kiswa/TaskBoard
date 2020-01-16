<?php
use RedBeanPHP\R;

class BeanLoader {

  public static function LoadAttachment(&$attachment, $json) {
    $data = json_decode($json);

    $attachment->filename = isset($data->filename) ? $data->filename : '';
    $attachment->name = isset($data->name) ? $data->name : '';
    $attachment->type = isset($data->type) ? $data->type : '';
    $attachment->user_id = isset($data->user_id) ? $data->user_id : -1;
    $attachment->timestamp = time();
    $attachment->task_id = isset($data->task_id) ? $data->task_id : -1;

    if (!isset($data->filename) || !isset($data->name) ||
      !isset($data->type) || !isset($data->user_id) ||
      !isset($data->task_id)) {
      return false;
    }

    return true;
  }

  public static function LoadAutoAction(&$action, $json) {
    $data = json_decode($json);

    $action->trigger = isset($data->trigger) ? $data->trigger : -1;
    $action->source_id = isset($data->source_id) ? $data->source_id: -1;
    $action->type = isset($data->type) ? $data->type : '';
    $action->change_to = isset($data->change_to) ? $data->change_to: -1;
    $action->board_id = isset($data->board_id) ? $data->board_id: -1;

    if (!isset($data->trigger) || !isset($data->type) ||
      !isset($data->board_id)) {
      return false;
    }

    return true;
  }

  public static function LoadBoard(&$board, $json) {
    $data = json_decode($json);

    $board->name = isset($data->name) ? $data->name : '';
    $board->is_active = isset($data->is_active) ? $data->is_active : false;

    if (isset($data->categories)) {
      self::updateObjectList('category', 'LoadCategory',
        $board->xownCategoryList, $data->categories);
    }

    if (isset($data->issue_trackers)) {
      self::updateObjectList('issuetracker', 'LoadIssueTracker',
        $board->xownIssueTrackerList,
        $data->issue_trackers);
    }

    if (isset($data->columns)) {
      self::updateObjectList('column', 'LoadColumn',
        $board->xownColumnList, $data->columns);
    }

    // Users do not get deleted when removed from a board
    if (isset($data->users)) {
      $board->sharedUserList = [];

      foreach ($data->users as $userData) {
        $user = R::load('user', $userData->id);

        if ((int)$user->id) {
          $board->sharedUserList[] = $user;
        }
      }
    }

    if (!isset($data->name) || !isset($data->is_active) ||
      !isset($data->categories) || !isset($data->columns) ||
      !isset($data->issue_trackers) || !isset($data->users)) {
      return false;
    }

    return true;
  }

  public static function LoadCategory(&$category, $json) {
    $data = json_decode($json);

    $category->name = isset($data->name) ? $data->name : '';
    $category->default_task_color = isset($data->default_task_color)
      ? $data->default_task_color : '';
    $category->board_id = isset($data->board_id) ? $data->board_id : -1;

    if (!isset($data->name) || !isset($data->default_task_color) ||
      !isset($data->board_id)) {
      return false;
    }

    return true;
  }

  public static function LoadColumn(&$column, $json) {
    $data = json_decode($json);

    $column->name = isset($data->name) ? $data->name : '';
    $column->position = isset($data->position) ? $data->position : -1;
    $column->board_id = isset($data->board_id) ? $data->board_id : -1;
    $column->task_limit = isset($data->task_limit) ? $data->task_limit : 0;

    if (isset($data->tasks)) {
      self::updateObjectList('task', 'LoadTask',
        $column->xownTaskList, $data->tasks);
    }

    if (!isset($data->name) || !isset($data->position) ||
      !isset($data->board_id)) {
      return false;
    }

    return true;
  }

  public static function LoadComment(&$comment, $json) {
    $data = json_decode($json);

    $comment->text = isset($data->text) ? $data->text : '';
    $comment->user_id = isset($data->user_id) ? $data->user_id : -1;
    $comment->task_id = isset($data->task_id) ? $data->task_id : -1;
    $comment->timestamp = isset($data->timestamp) ? $data->timestamp : -1;
    $comment->is_edited = isset($data->is_edited) ? $data->is_edited : false;

    if (!isset($data->text) || !isset($data->user_id) ||
      !isset($data->task_id) || !isset($data->timestamp)) {
      return false;
    }

    return true;
  }

  public static function LoadIssueTracker(&$tracker, $json) {
    $data = json_decode($json);

    $tracker->url = isset($data->url) ? $data->url : '';
    $tracker->regex = isset($data->regex) ? $data->regex : '';
    $tracker->board_id = isset($data->board_id) ? $data->board_id : -1;

    if (!isset($data->url) || !isset($data->regex) ||
      !isset($data->board_id)) {
      return false;
    }

    return true;
  }

  public static function LoadTask(&$task, $json) {
    $data = json_decode($json);

    $task->title = isset($data->title) ? $data->title : '';
    $task->description = isset($data->description)
      ? $data->description : '';
    $task->color = isset($data->color) ? $data->color : '';
    $task->due_date = isset($data->due_date) ? $data->due_date : '';
    $task->points = isset($data->points) ? $data->points : 0;
    $task->position = isset($data->position) ? $data->position : -1;
    $task->column_id = isset($data->column_id) ? $data->column_id : -1;

    if (isset($data->comments)) {
      self::updateObjectList('comment', 'LoadComment',
        $task->xownCommentList, $data->comments);
    }

    if (isset($data->attachments)) {
      self::updateObjectList('attachment', 'LoadAttachment',
        $task->xownAttachmentList, $data->attachments);
    }

    if (isset($data->assignees)) {
      $task->sharedUserList = [];

      foreach ($data->assignees as $assignee) {
        $user = R::load('user', $assignee->id);

        if ((int)$user->id) {
          $task->sharedUserList[] = $user;
        }
      }
    }

    if (isset($data->categories)) {
      $task->sharedCategoryList = [];

      foreach ($data->categories as $category) {
        $cat = R::load('category', $category->id);

        if ((int)$cat->id) {
          $task->sharedCategoryList[] = $cat;
        }
      }
    }

    if (!isset($data->title) || !isset($data->position) ||
      !isset($data->column_id)) {
      return false;
    }

    return true;
  }

  public static function LoadUser(&$user, $json) {
    $data = json_decode($json);

    $user->security_level = isset($data->security_level)
      ? $data->security_level : -1;
    $user->username = isset($data->username) ? $data->username : '';
    $user->email = isset($data->email) ? $data->email : '';
    $user->default_board_id = isset($data->default_board_id)
      ? $data->default_board_id : -1;
    $user->user_option_id = isset($data->user_option_id)
      ? $data->user_option_id : -1;
    $user->last_login = isset($data->last_login) ? $data->last_login : '';
    $user->password_hash = isset($data->password_hash)
      ? $data->password_hash : '';

    if (!isset($data->security_level) || !isset($data->username)) {
      return false;
    }

    return true;
  }

  public static function LoadUserOption(&$opts, $json) {
    $data = json_decode($json);

    $opts->new_tasks_at_bottom = isset($data->new_tasks_at_bottom)
      ? (boolean)$data->new_tasks_at_bottom : true;
    $opts->show_animations = isset($data->show_animations)
      ? (boolean)$data->show_animations : true;
    $opts->show_assignee = isset($data->show_assignee)
      ? (boolean)$data->show_assignee : true;
    $opts->multiple_tasks_per_row = isset($data->multiple_tasks_per_row)
      ? (boolean)$data->multiple_tasks_per_row : false;
    $opts->language = isset($data->language)
      ? $data->language : '';

    if (!isset($data->new_tasks_at_bottom) ||
      !isset($data->show_animations) || !isset($data->show_assignee) ||
      !isset($data->multiple_tasks_per_row) || !isset($data->language)) {
      return false;
    }

    return true;
  }

  private static function removeObjectsNotInData($type, &$dataList, &$objectList) {
    $dataIds = [];

    foreach ($dataList as $data) {
      if (isset($data->id)) {
        $dataIds[] = (int)$data->id;
      }
    }

    foreach ($objectList as $existing) {
      if (!in_array((int)$existing->id, $dataIds)) {
        $remove = R::load($type, $existing->id);
        R::trash($remove);
      }
    }
  }

  private static function loadObjectsFromData($type, $loadFunc, &$dataList,
    &$objectList) {
    foreach ($dataList as $obj) {
      $object = R::load($type, (isset($obj->id) ? $obj->id : 0));

      call_user_func_array(array(__CLASS__, $loadFunc),
        array(&$object, json_encode($obj)));
      $objectList[] = $object;
    }
  }

  private static function updateObjectList($type, $loadFunc,
    &$objectList = [],
    &$dataList = []) {
    if (count($objectList) && count($dataList)) {
      self::removeObjectsNotInData($type, $dataList, $objectList);
    }

    if (count($dataList)) {
      self::loadObjectsFromData($type, $loadFunc, $dataList, $objectList);
    }

    // Remove all objects from existing boardlist when none in datalist
    if (!count($dataList) && count($objectList)) {
      foreach ($objectList as $obj) {
        R::trash($obj);
      }
    }
  }

}

