<?php
use PHPMailer\PHPMailer\PHPMailer;

class Mailer {
  // Edit these values for your email setup.
  const USE_SENDMAIL = true; // If false, uses SMTP settings below
  const FROM_EMAIL = 'taskboard@hostname.com';
  const FROM_NAME = 'TaskBoard';

  // SMTP Settings - Not used if USE_SENDMAIL is true
  const SMTP_HOST = 'smtp.gmail.com';
  const SMTP_PORT = 587;
  const SMTP_USER = 'you@gmail.com';
  const SMTP_PASS = 'yourPassword';
  // End SMTP Settings

  // DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING

  private $strings;
  private $mail;

  public function __construct(string $lang)
  {
    $this->loadStrings($lang);
  }

  /**
   * Send email to one or more users in the provided list.
   * @param $users List of users to email (must have at least one).
   * @param $data  Object containing template type and replacements for template.
   */
  public function sendMail($users, $data) {
    $this->initMail();

    if (count($users) < 1) {
      return $this->strings->mail_error;
    }

    foreach($users as $user) {
      $this->mail->addAddress($user->email);
    }

    $this->mail->Subject = $this->strings->mail_subject;
    $this->mail->msgHTML($this->parseTemplate($data));

    if (!$this->mail->send()) {
      return $this->strings->mail_error;
    }

    return $this->strings->mail_sent;
  }

  private function parseTemplate($data) {
    $template = $this->getTemplate($data->type);

    str_replace('%username%', $data->username, $template);
    str_replace('%boardName%', $data->boardName, $template);
    str_replace('%taskName%', $data->taskName, $template);
    str_replace('%comment%', $data->comment, $template);
    str_replace('%taskDescription%', $data->taskDescription, $template);
    str_replace('%taskDueDate%', $data->taskDueDate, $template);
    str_replace('%taskAssignees%', $data->taskAssignees, $template);
    str_replace('%taskCategories%', $data->taskCategories, $template);
    str_replace('%taskPoints%', $data->taskPoints, $template);
    str_replace('%taskColumnName%', $data->taskColumnName, $template);
    str_replace('%taskPosition%', $data->taskPosition, $template);
    str_replace('%hostUrl%', $data->hostUrl, $template);
    str_replace('%boardId%', $data->boardId, $template);

    return $template;
  }

  private function getTemplate($type) {
    $template = '';

    switch($type) {
    case 'editBoard':
      $template = $this->strings->mail_template_editBoard;
      break;

    case 'editComment':
      $template = $this->strings->mail_template_editComment;
      break;

    case 'editTask':
      $template = $this->strings->mail_template_editTask;
      break;

    case 'newBoard':
      $template = $this->strings->mail_template_newBoard;
      break;

    case 'newComment':
      $template = $this->strings->mail_template_newComment;
      break;

    case 'newTask':
      $template = $this->strings->mail_template_newTask;
    }

    $template .= $this->strings->mail_template_openBoardLink;

    return $template;
  }

  private function initMail() {
    $this->mail = new PHPMailer();
    $this->mail->isSendmail();

    $this->mail->setFrom($this->FROM_EMAIL, $this->FROM_NAME);

    if (!$this->USE_SENDMAIL) {
      $this->mail->isSMTP();

      $this->mail->Host = $this->SMTP_HOST;
      $this->mail->Port = $this->SMTP_PORT;
      $this->mail->Username = $this->SMTP_USER;
      $this->mail->Password = $this->SMTP_PASS;

      $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      $this->mail->SMTPAuth = true;
    }
  }

  private function loadStrings($lang) {
    $json = '{}';

    if (!$lang) {
      $lang = 'en';
    }

    try {
      $json =
        file_get_contents(__DIR__ . '/../../strings/' .  $lang . '_api.json');
    } catch (Exception $ex) {
      $ex->getMessage();

      $json = file_get_contents(__DIR__ . '/../../json/' . $lang . '_api.json');
    }

    $this->strings = json_decode($json);
  }
}
