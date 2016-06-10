<?php
require_once __DIR__ . '/../Mocks.php';

/**
 * @group single
 */
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
        $this->markTestSkipped('TODO');

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

    public function testAddRemoveAttachment() {
        $this->markTestSkipped('TODO');

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

    public function testAddRemoveUnprivileged() {
        $this->markTestSkipped('TODO');

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
        $this->markTestSkipped('TODO');

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

    private function createAttachment() {
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

