<?php
require_once __DIR__ . '/../Mocks.php';

class AttachmentTest extends PHPUnit_Framework_TestCase {
    private $json = '';
    private $bean;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    protected function setUp() {
        RedBeanPHP\R::nuke();

        if ($this->json !== '') {
            return;
        }

        $attachment = DataMock::getAttachment();
        $this->json = json_encode($attachment);
        $this->bean = $attachment;
    }

    public function testCreateAttachment() {
        $attachment = new Attachment(new ContainerMock());
        $this->assertDefaultProperties($attachment);
    }

    public function testLoadFromJson() {
        $attachment = new Attachment(new ContainerMock());

        $attachment->loadFromJson('');
        $this->assertDefaultProperties($attachment);

        $attachment->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($attachment);

        $attachment->loadFromJson($this->json);
        $this->assertMockProperties($attachment);
    }

    public function testLoadFromBean() {
        $attachment = new Attachment(new ContainerMock());

        $attachment->loadFromBean(null);
        $this->assertDefaultProperties($attachment);

        $attachment->loadFromBean($this->bean);
        $this->assertMockProperties($attachment);
    }

    public function testUpdateBean() {
        $attachment = new Attachment(new ContainerMock());
        $attachment->loadFromBean($this->bean);

        $attachment->updateBean();
        $bean = $attachment->getBean();

        $this->assertEquals($bean->filename, $attachment->filename);
        $this->assertEquals($bean->name, $attachment->name);
        $this->assertEquals($bean->type, $attachment->type);
        $this->assertEquals($bean->user_id, $attachment->user_id);
        $this->assertEquals($bean->task_id, $attachment->task_id);
        $this->assertEquals($bean->timestamp, $attachment->timestamp);
    }

    private function assertMockProperties($attachment) {
        $this->assertEquals(1, $attachment->id);
        $this->assertEquals('file', $attachment->filename);
        $this->assertEquals('file.png', $attachment->name);
        $this->assertEquals('image', $attachment->type);
        $this->assertEquals(1, $attachment->user_id);
        $this->assertEquals(1, $attachment->task_id);
        $this->assertEquals(1234567890, $attachment->timestamp);
    }

    private function assertDefaultProperties($attachment) {
        $this->assertEquals(0, $attachment->id);
        $this->assertEquals('', $attachment->filename);
        $this->assertEquals('', $attachment->name);
        $this->assertEquals('', $attachment->type);
        $this->assertEquals(0, $attachment->user_id);
        $this->assertEquals(0, $attachment->task_id);
        $this->assertEquals(null, $attachment->timestamp);
    }
}

