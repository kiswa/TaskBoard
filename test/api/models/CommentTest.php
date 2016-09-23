<?php
require_once __DIR__ . '/../Mocks.php';

class CommentTest extends PHPUnit_Framework_TestCase {
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

        $comment = DataMock::getComment();
        $this->json = json_encode($comment);
        $this->bean = $comment;
    }

    public function testCreateComment() {
        $comment = new Comment(new ContainerMock());
        $this->assertDefaultProperties($comment);
    }

    public function testLoadFromBean() {
        $comment = new Comment(new ContainerMock());

        $comment->loadFromBean(null);
        $this->assertDefaultProperties($comment);

        $comment->loadFromBean($this->bean);
        $this->assertMockProperties($comment);
    }

    public function testLoadFromJson() {
        $comment = new Comment(new ContainerMock());

        $comment->loadFromJson('');
        $this->assertDefaultProperties($comment);

        $comment->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($comment);

        $comment->loadFromJson($this->json);
        $this->assertMockProperties($comment);
    }

    public function testUpdateBean() {
        $comment = new Comment(new ContainerMock());
        $comment->loadFromBean($this->bean);

        $comment->updateBean();
        $bean = $comment->getBean();

        $this->assertEquals($bean->text, $comment->text);
        $this->assertEquals($bean->user_id, $comment->user_id);
        $this->assertEquals($bean->task_id, $comment->task_id);
    }

    private function assertDefaultProperties($comment) {
        $this->assertEquals(0, $comment->id);
        $this->assertEquals('', $comment->text);
        $this->assertEquals(0, $comment->user_id);
        $this->assertEquals(0, $comment->task_id);
    }

    private function assertMockProperties($comment) {
        $this->assertEquals(1, $comment->id);
        $this->assertEquals('test comment', $comment->text);
        $this->assertEquals(1, $comment->user_id);
        $this->assertEquals(1, $comment->task_id);
    }
}

