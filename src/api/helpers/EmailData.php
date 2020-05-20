<?php
class EmailData {
  public string $hostUrl;
  public string $boardId;

  public string $type;
  public string $username;
  public string $boardName;

  public string $comment;
  public string $taskName;

  public string $taskDescription;
  public string $taskDueDate;
  public string $taskAssignees;
  public string $taskCategories;
  public string $taskPoints;
  public string $taskColumnName;
  public string $taskPosition;

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
