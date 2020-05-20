<?php
class EmailData {
  public $hostUrl;
  public $boardId;

  public $type;
  public $username;
  public $boardName;

  public $comment;
  public $taskName;

  public $taskDescription;
  public $taskDueDate;
  public $taskAssignees;
  public $taskCategories;
  public $taskPoints;
  public $taskColumnName;
  public $taskPosition;

  public function __construct($boardId) {
    $this->hostUrl = $_SERVER['HTTP_REFERER'];
    $this->boardId = $boardId;

    $this->type = '';
    $this->username = '';
    $this->boardName = '';

    $this->comment = '';
    $this->taskName = '';

    $this->taskDescription = '';
    $this->taskDueDate = '';
    $this->taskAssignees = '';
    $this->taskCategories = '';
    $this->taskPoints = '';
    $this->taskColumnName = '';
    $this->taskPosition = '';
  }
}
