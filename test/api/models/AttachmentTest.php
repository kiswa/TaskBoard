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

        $this->assertTrue($bean->id === $attachment->id);
        $this->assertTrue($bean->filename === $attachment->filename);
        $this->assertTrue($bean->name === $attachment->name);
        $this->assertTrue($bean->type === $attachment->type);
        $this->assertTrue($bean->user_id === $attachment->user_id);
        $this->assertTrue($bean->task_id === $attachment->task_id);
        $this->assertTrue($bean->timestamp === $attachment->timestamp);
    }

    private function assertMockProperties($attachment) {
        $this->assertTrue($attachment->id === 1);
        $this->assertTrue($attachment->filename === 'file');
        $this->assertTrue($attachment->name === 'file.png');
        $this->assertTrue($attachment->type === 'image');
        $this->assertTrue($attachment->user_id === 1);
        $this->assertTrue($attachment->task_id === 1);
        $this->assertTrue($attachment->timestamp === 1234567890);
    }

    private function assertDefaultProperties($attachment) {
        $this->assertTrue($attachment->id === 0);
        $this->assertTrue($attachment->filename === '');
        $this->assertTrue($attachment->name === '');
        $this->assertTrue($attachment->type === '');
        $this->assertTrue($attachment->user_id === 0);
        $this->assertTrue($attachment->task_id === 0);
        $this->assertTrue($attachment->timestamp === null);
    }
}

