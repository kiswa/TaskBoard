<?php

require_once('mailConfig.php');


function createMailObject() {

    global $MAIL_HOST, $MAIL_USERNAME, $MAIL_PASSWORD, $MAIL_SMTPSECURE, $MAIL_PORT, $MAIL_FROM, $MAIL_FROMNAME;

    $mail = new PHPMailer;

    $mail->isSMTP();
    $mail->Host = $MAIL_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = $MAIL_USERNAME;
    $mail->Password = $MAIL_PASSWORD;
    $mail->SMTPSecure = $MAIL_SMTPSECURE;
    $mail->Port = $MAIL_PORT;

    $mail->From = $MAIL_FROM;
    $mail->FromName = $MAIL_FROMNAME;

    return $mail;
}

function sendEmail($email, $recipient, $subject, $body) {
    $mail = createMailObject();
    $mail->addAddress($email, $recipient);     // Add a recipient
    $mail->isHTML(true);

    $mail->Subject = $subject;
    $mail->Body    = $body;

    $mail->send();
}

function getNewBoardEmailBody($boardid, $username, $boardname) {
    $message = file_get_contents('mail_templates/newBoard.html');
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);
    return $message;
}

function getEditBoardEmailBody($boardid, $username, $boardname) {
    $message = file_get_contents('mail_templates/editBoard.html');
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);
    return $message;
}

function getNewItemEmailBody($boardid, $username, $boardname, $title, $description, $assignee, $category, $dueDate, $points, $position)
{
    $message = file_get_contents('mail_templates/newItem.html');
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);
    $message = str_replace('%title%', $title, $message);
    $message = str_replace('%description%', $description, $message);
    $message = str_replace('%assignee%', $assignee, $message);
    $message = str_replace('%category%', $category, $message);
    $message = str_replace('%duedate%', $dueDate, $message);
    $message = str_replace('%points%', $points, $message);
    $message = str_replace('%position%', $position, $message);
    return $message;
}

function getEditItemEmailBody($boardid, $username, $boardname, $title, $description, $assignee, $category, $dueDate, $points, $position)
{
    $message = file_get_contents('mail_templates/editItem.html');
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);
    $message = str_replace('%title%', $title, $message);
    $message = str_replace('%description%', $description, $message);
    $message = str_replace('%assignee%', $assignee, $message);
    $message = str_replace('%category%', $category, $message);
    $message = str_replace('%duedate%', $dueDate, $message);
    $message = str_replace('%points%', $points, $message);
    $message = str_replace('%position%', $position, $message);
    return $message;
}

function getNewCommentEmailBody($boardid, $username, $boardname, $title, $comment)
{
    $message = file_get_contents('mail_templates/newComment.html');
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);
    $message = str_replace('%title%', $title, $message);
    $message = str_replace('%comment%', $comment, $message);
    return $message;
}

function getEditCommentEmailBody($boardid, $username, $boardname, $title, $comment)
{
    $message = file_get_contents('mail_templates/editComment.html');
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);
    $message = str_replace('%title%', $title, $message);
    $message = str_replace('%comment%', $comment, $message);
    return $message;
}