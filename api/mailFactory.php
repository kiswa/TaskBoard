<?php
require_once('mailConfig.php');

function getBaseUrl() {
	# From github (lavoiesl/paths.php)
	$base_dir  = __DIR__; // Absolute path to your installation, ex: /var/www/mywebsite
	$doc_root  = preg_replace("!${_SERVER['SCRIPT_NAME']}$!", '', $_SERVER['SCRIPT_FILENAME']); # ex: /var/www
	$base_url  = preg_replace("!^${doc_root}!", '', $base_dir); # ex: '' or '/mywebsite'
	$base_url  = preg_replace("!/api$!", '', $base_url); # remove trailin "/api" -- FIXME (not too elegant)
	$protocol  = empty($_SERVER['HTTPS']) ? 'http' : 'https';
	$port      = $_SERVER['SERVER_PORT'];
	$disp_port = ($protocol == 'http' && $port == 80 || $protocol == 'https' && $port == 443) ? '' : ":$port";
	$domain    = $_SERVER['SERVER_NAME'];
	$full_url  = "${protocol}://${domain}${disp_port}${base_url}"; # Ex: 'http://example.com', 'https://example.com/mywebsite', etc.
	
	return ($full_url);
}

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
    $message = str_replace('%baseurl%', getBaseUrl(), $message);
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);

    return $message;
}

function getEditBoardEmailBody($boardid, $username, $boardname) {
    $message = file_get_contents('mail_templates/editBoard.html');
    $message = str_replace('%baseurl%', getBaseUrl(), $message);
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);

    return $message;
}

function getNewItemEmailBody($boardid, $username, $boardname, $title, $description, $assignee, $category, $dueDate, $points, $position)
{
    $message = file_get_contents('mail_templates/newItem.html');
    $message = str_replace('%baseurl%', getBaseUrl(), $message);
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
    $message = str_replace('%baseurl%', getBaseUrl(), $message);
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
    $message = str_replace('%baseurl%', getBaseUrl(), $message);
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
    $message = str_replace('%baseurl%', getBaseUrl(), $message);
    $message = str_replace('%boardid%', $boardid, $message);
    $message = str_replace('%username%', $username, $message);
    $message = str_replace('%boardname%', $boardname, $message);
    $message = str_replace('%title%', $title, $message);
    $message = str_replace('%comment%', $comment, $message);

    return $message;
}
