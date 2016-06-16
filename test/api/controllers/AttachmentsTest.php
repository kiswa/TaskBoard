<?php
require_once __DIR__ . '/../Mocks.php';

class AttachmentsTest extends PHPUnit_Framework_TestCase {
    private $attachments;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->attachments = new Attachments(new ContainerMock());
    }

    public function testGetAttachment() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->attachments->getAttachment($request,
            new ResponseMock(), $args);
        $this->assertEquals('No attachment found for ID 1.',
            $actual->alerts[0]['text']);

        $this->createAttachment();
        $request->header = [DataMock::getJwt()];

        $this->attachments = new Attachments(new ContainerMock());

        $actual = $this->attachments->getAttachment($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetAttachmentForbidden() {
        $this->createAttachment();

        DataMock::createBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $this->attachments = new Attachments(new ContainerMock());

        $actual = $this->attachments->getAttachment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveAttachment() {
        $actual = $this->createAttachment();

        $this->assertEquals('Attachment added.', $actual->alerts[0]['text']);

        $args = [];
        $args['id'] = 1;

        $this->attachments = new Attachments(new ContainerMock());
        $request =new RequestMock();
        $request->header = [DataMock::getJwt()];

        $actual = $this->attachments->removeAttachment($request,
            new ResponseMock(), $args);

        $this->assertEquals('Attachment file.png removed.',
            $actual->alerts[0]['text']);
    }

    public function testAddBadAttachment() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->attachments->addAttachment($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testAddAttachmentForbidden() {
        $this->createBoard();
        $this->createTask();
        DataMock::createBoardAdminUser();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $attachment = DataMock::getAttachment();
        $attachment->id = 0;

        $request->payload = $attachment;

        $this->attachments = new Attachments(new ContainerMock());

        $actual = $this->attachments->addAttachment($request,
            new ResponseMock(), null);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testAddRemoveUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->attachments = new Attachments(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $attachment = DataMock::getAttachment();
        $attachment->id = 0;

        $request->payload = $attachment;

        $actual = $this->attachments->addAttachment($request,
            new ResponseMock(), null);

        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $this->createAttachment();
        $this->attachments = new Attachments(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $args = [];
        $args['id'] = 1;

        $actual = $this->attachments->removeAttachment($request,
            new ResponseMock(), $args);

        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testGetUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->attachments = new Attachments(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $args = [];
        $args['id'] = 1;

        $actual = $this->attachments->getAttachment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveAttachmentUserSecurity() {
        $actual = $this->createAttachment();
        $this->assertEquals('Attachment added.', $actual->alerts[0]['text']);

        $res = DataMock::createStandardUser();
        $this->assertEquals('success', $res->status);

        $args = [];
        $args['id'] = 1;

        $this->attachments = new Attachments(new ContainerMock());
        $request =new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->attachments->removeAttachment($request,
            new ResponseMock(), $args);

        $this->assertEquals('You do not have sufficient permissions to ' .
            'remove this attachment.', $actual->alerts[0]['text']);

    }

    public function testRemoveBadAttachment() {
        $args = [];
        $args['id'] = 5; // No such attachment

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $response = $this->attachments->removeAttachment($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    private function createBoard() {
        $board = DataMock::getBoard();
        $board->users = [];
        $board->users[] = new User(new ContainerMock(), 1);
        $board->auto_actions = [];

        $request = new RequestMock();
        $request->payload = $board;
        $request->header = [DataMock::getJwt()];

        $boards = new Boards(new ContainerMock());
        $boards->addBoard($request, new ResponseMock(), null);
    }

    private function createTask() {
        $task = DataMock::getTask();
        $task->id = 0;

        $request = new RequestMock();
        $request->payload = $task;
        $request->header = [DataMock::getJwt()];

        $tasks = new Tasks(new ContainerMock());
        $tasks->addTask($request, new ResponseMock(), null);
    }

    private function createAttachment() {
        $this->createBoard();
        $this->createTask();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $attachment = DataMock::getAttachment();
        $attachment->id = 0;

        $request->payload = $attachment;

        $response = $this->attachments->addAttachment($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $response->status);

        return $response;
    }
}

