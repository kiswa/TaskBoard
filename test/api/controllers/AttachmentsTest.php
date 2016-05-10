<?php
require_once __DIR__ . '/../Mocks.php';

class AttachmentsTest extends PHPUnit_Framework_TestCase {
    private $attachments;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
            // RedBeanPHP\R::fancyDebug(true);
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        $this->attachments = new Attachments(new ContainerMock());
    }

    public function testGetAttachment() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No attachment found for ID 1.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->attachments->getAttachment(null,
            new ResponseMock(), $args);
        $this->assertEquals($expected, $actual);
    }

    /**
     * @group single
     */
    public function testAddRemoveAttachment() {
        $expected = new ApiJson();

        $actual = $this->createAttachment();

        $expected->setSuccess();
        $expected->addAlert('success', 'Attachment added.');

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'Attachment file.png removed.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->attachments->removeAttachment(null,
            new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

    private function createAttachment() {
        $request = new RequestMock();
        $attachment = DataMock::getAttachment();
        $attachment->id = 0;

        $request->payload = $attachment;

        $response = $this->attachments->addAttachment($request,
            new ResponseMock(), null);
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

