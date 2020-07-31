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
   *
   * @param $emails List of email addresses (must have at least one).
   * @param $data  Object containing template type and replacements for template.
   */
  public function sendMail($emails, $data) {
    $this->initMail();

    if (count($emails) < 1) {
      return '';
    }

    foreach($emails as $user) {
      $this->mail->addAddress($user);
    }

    $this->mail->Subject = $this->strings->mail_subject;
    $this->mail->msgHTML($this->parseTemplate($data));

    if (!$this->mail->send()) {
      return $this->strings->mail_error;
    }

    return $this->strings->mail_sent; // @codeCoverageIgnore
  }

  private function parseTemplate(EmailData $data) {
    $template = $this->getTemplate($data->type);

    $template = str_replace('%hostUrl%', $data->hostUrl, $template);
    $template = str_replace('%boardId%', $data->boardId, $template);

    $template = str_replace('%username%', $data->username, $template);
    $template = str_replace('%boardName%', $data->boardName, $template);

    $template = str_replace('%comment%', $data->comment, $template);
    $template = str_replace('%taskName%', $data->taskName, $template);

    $template =
      str_replace('%taskDescription%', $data->taskDescription, $template);
    $template = str_replace('%taskDueDate%', $data->taskDueDate, $template);
    $template = str_replace('%taskAssignees%', $data->taskAssignees, $template);
    $template =
      str_replace('%taskCategories%', $data->taskCategories, $template);
    $template = str_replace('%taskPoints%', $data->taskPoints, $template);
    $template =
      str_replace('%taskColumnName%', $data->taskColumnName, $template);
    $template = str_replace('%taskPosition%', $data->taskPosition, $template);

    return $template;
  }

  /**
   * @codeCoverageIgnore
   */
  private function getTemplate($type) {
    $template = '';

    switch($type) {
    case 'newBoard':
      $template = $this->strings->mail_template_newBoard;
      break;

    case 'newComment':
      $template = $this->strings->mail_template_newComment;
      break;

    case 'newTask':
      $template = $this->strings->mail_template_newTask;

    case 'editBoard':
      $template = $this->strings->mail_template_editBoard;
      break;

    case 'editComment':
      $template = $this->strings->mail_template_editComment;
      break;

    case 'editTask':
      $template = $this->strings->mail_template_editTask;
      break;

    case 'removeBoard':
      $template = $this->strings->mail_template_removeBoard;
      break;

    case 'removeComment':
      $template = $this->strings->mail_template_removeComment;
      break;

    case 'removeTask':
      $template = $this->strings->mail_template_removeTask;
      break;
    }

    $template .= $this->strings->mail_template_openBoardLink;

    return $template;
  }

  private function initMail() {
    $this->mail = new PHPMailer();
    $this->mail->isSendmail();

    $this->mail->setFrom(Mailer::FROM_EMAIL, Mailer::FROM_NAME);
    $this->mail->CharSet = PHPMailer::CHARSET_UTF8;

    // @codeCoverageIgnoreStart
    if (!Mailer::USE_SENDMAIL) {
      $this->mail->isSMTP();

      $this->mail->Host = Mailer::SMTP_HOST;
      $this->mail->Port = Mailer::SMTP_PORT;
      $this->mail->Username = Mailer::SMTP_USER;
      $this->mail->Password = Mailer::SMTP_PASS;

      $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      $this->mail->SMTPAuth = true;
    }
    // @codeCoverageIgnoreEnd
  }

  private function loadStrings($lang) {
    $json = '{}';

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
