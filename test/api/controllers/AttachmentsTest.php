<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class AttachmentsTest extends PHPUnit\Framework\TestCase {
  private $attachments;

  const diskfilename = '638df56a901567375d06757aeac8317366eb0ade';

  public static function setUpBeforeClass(): void {
    try {
      R::setup('sqlite:tests.db');
    } catch (Exception $ex) {
    }
  }

  public function setUp(): void {
    R::nuke();
    Auth::CreateInitialAdmin(new LoggerMock());

    $this->attachments = new Attachments(new LoggerMock());
  }

  public function testGetAttachment() {
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $args = [];
    $args['id'] = 1;

    $actual = $this->attachments->getAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('No attachment found for ID 1.',
      $actual->body->data->alerts[0]['text']);

    $this->createAttachment();
    $request->header = [DataMock::GetJwt()];

    $this->attachments = new Attachments(new LoggerMock());

    $actual = $this->attachments->getAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('success', $actual->body->data->status);
    $this->assertEquals(2, count($actual->body->data->data));
  }

  public function testGetAttachmentInvalid() {
    $request = new RequestMock();
    $request->hasHeader = false;

    $args = [];
    $args['id'] = 1;

    $actual = $this->attachments->getAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('error', $actual->body->data->alerts[0]['type']);
  }

  public function testGetAttachmentForbidden() {
    $this->createAttachment();

    $args = [];
    $args['id'] = 1;

    $actual = $this->attachments->getAttachment(new RequestMock(),
      new ResponseMock(), $args);
    $this->assertEquals('error', $actual->body->data->alerts[0]['type']);

    DataMock::CreateBoardAdminUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $this->attachments = new Attachments(new LoggerMock());

    $actual = $this->attachments->getAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testGetAttachmentByHash() {
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $args = [];
    $args['hash'] = AttachmentsTest::diskfilename;

    $actual = $this->attachments->getAttachmentByHash($request,
      new ResponseMock(), $args);
    $this->assertEquals('No attachment found for hash ' .
      AttachmentsTest::diskfilename  . '.',
      $actual->body->data->alerts[0]['text']);

    $this->createAttachment();
    $request->header = [DataMock::GetJwt()];

    $this->attachments = new Attachments(new LoggerMock());

    $actual = $this->attachments->getAttachmentByHash($request,
      new ResponseMock(), $args);
    $this->assertEquals('success', $actual->body->data->status);
    $this->assertEquals(2, count($actual->body->data->data));
  }

  public function testGetAttachmentByHashInvalid() {
    $request = new RequestMock();
    $request->hasHeader = false;

    $args = [];
    $args['hash'] = AttachmentsTest::diskfilename;

    $actual = $this->attachments->getAttachmentByHash($request,
      new ResponseMock(), $args);
    $this->assertEquals('error', $actual->body->data->alerts[0]['type']);
  }

  public function testGetAttachmentByHashForbidden() {
    $this->createAttachment();

    $args = [];
    $args['hash'] = AttachmentsTest::diskfilename;

    $actual = $this->attachments->getAttachmentByHash(new RequestMock(),
      new ResponseMock(), $args);
    $this->assertEquals('error', $actual->body->data->alerts[0]['type']);

    DataMock::CreateBoardAdminUser();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $this->attachments = new Attachments(new LoggerMock());

    $actual = $this->attachments->getAttachmentByHash($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testAddAttachment() {
    $task = R::dispense('task');
    R::store($task);

    $data = new stdClass();
    $data->filename = 'test';
    $data->name = 'test.png';
    $data->type = 'image';
    $data->user_id = 1;
    $data->task_id = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];
    $request->payload = $data;

    $actual = $this->attachments->addAttachment($request,
      new ResponseMock(), null);
    $this->assertEquals('Attachment added.',
      $actual->body->data->alerts[0]['text']);

    rmdir('uploads/');
  }

  public function testAddAttachmentInvalid() {
    $request = new RequestMock();
    $request->invalidPayload = true;
    $request->header = [DataMock::GetJwt()];

    $actual = $this->attachments->addAttachment($request,
      new ResponseMock(), null);
    $this->assertEquals('failure', $actual->body->data->status);
    $this->assertEquals('error', $actual->body->data->alerts[0]['type']);

    rmdir('uploads/');
  }

  public function testAddAttachmentForbidden() {
    $task = R::dispense('task');
    R::store($task);

    $attachment = new stdClass();
    $attachment->filename = "test";
    $attachment->name = 'test.png';
    $attachment->type = 'image';
    $attachment->user_id = 1;
    $attachment->task_id = 1;

    $request = new RequestMock();
    $request->payload = $attachment;

    $actual = $this->attachments->addAttachment($request,
      new ResponseMock(), null);
    $this->assertEquals('error', $actual->body->data->alerts[0]['type']);

    DataMock::CreateBoardAdminUser();
    $request->header = [DataMock::GetJwt(2)];

    $this->attachments = new Attachments(new LoggerMock());

    $actual = $this->attachments->addAttachment($request,
      new ResponseMock(), null);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);

    rmdir('uploads/');
  }

  public function testUploadFile() {
    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $args = [];
    $args['hash'] = AttachmentsTest::diskfilename;

    $actual = $this->attachments->uploadFile($request,
      new ResponseMock(), $args);
    $this->assertEquals('Error uploading attachment. Please try again.',
      $actual->body->data->alerts[0]['text']);

    $this->createAttachment();
    $request->header = [DataMock::GetJwt()];

    $this->attachments = new Attachments(new LoggerMock());

    $_FILES['file'] = [];
    $_FILES['file']['tmp_name'] = 'asdf';
    $_FILES['file']['error'] = 1;

    $actual = $this->attachments->uploadFile($request,
      new ResponseMock(), $args);
    $this->assertEquals('failure', $actual->body->data->status);
    $this->assertEquals(1, count($actual->body->data->data));

    $_FILES['file'] = [];
    $_FILES['file']['tmp_name'] = 'asdf';
    $_FILES['file']['error'] = 0;

    $this->createAttachment();
    $request->header = [DataMock::GetJwt()];

    $this->attachments = new Attachments(new LoggerMock());

    $actual = $this->attachments->uploadFile($request,
      new ResponseMock(), $args);
    $this->assertEquals('success', $actual->body->data->status);
    $this->assertEquals(1, count($actual->body->data->data));
  }

  public function testUploadFileForbidden() {
    DataMock::CreateBoardAdminUser();
    $this->createAttachment();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $args = [];
    $args['hash'] = AttachmentsTest::diskfilename;

    $this->attachments = new Attachments(new LoggerMock());

    $actual = $this->attachments->uploadFile($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);

    $this->attachments = new Attachments(new LoggerMock());
    $request->header = [DataMock::GetJwt(3)];

    $actual = $this->attachments->uploadFile($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveAttachment() {
    $this->createAttachment();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->attachments->removeAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('Attachment removed (file.png).',
      $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveUnprivileged() {
    DataMock::CreateUnprivilegedUser();
    $this->createAttachment();

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $args = [];
    $args['id'] = 1;

    $actual = $this->attachments->removeAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveAttachmentUserSecurity() {
    $this->createAttachment();
    DataMock::CreateStandardUser();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->attachments->removeAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('You do not have sufficient permissions to ' .
      'remove this attachment.', $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveAttachmentForbidden() {
    $this->createAttachment();
    DataMock::CreateBoardAdminUser();

    $args = [];
    $args['id'] = 1;

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt(2)];

    $actual = $this->attachments->removeAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('Access restricted.',
      $actual->body->data->alerts[0]['text']);
  }

  public function testRemoveBadAttachment() {
    $this->createAttachment();

    $args = [];
    $args['id'] = 2; // No such attachment

    $request = new RequestMock();
    $request->header = [DataMock::GetJwt()];

    $actual = $this->attachments->removeAttachment($request,
      new ResponseMock(), $args);
    $this->assertEquals('Error removing attachment. ' .
      'No attachment found for ID 2.', $actual->body->data->alerts[0]['text']);
  }

  private function createAttachment() {
    $board = R::dispense('board');
    $column = R::dispense('column');
    $task = R::dispense('task');
    $attachment = R::dispense('attachment');

    $attachment->name = 'file.png';
    $attachment->user_id = 1;
    $attachment->diskfilename = AttachmentsTest::diskfilename;

    $task->xownAttachmentList[] = $attachment;
    $column->xownTaskList[] = $task;
    $board->xownColumnList[] = $column;
    R::store($board);
  }
}

