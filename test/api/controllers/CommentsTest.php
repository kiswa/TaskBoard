<?php
require_once __DIR__ . '/../Mocks.php';

class CommentsTest extends PHPUnit_Framework_TestCase {
    private $comments;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
            // RedBeanPHP\R::fancyDebug(true);
        } catch (Exception $ex) { }
    }

    public function setUp() {
        RedBeanPHP\R::nuke();

        $this->comments = new Comments(new ContainerMock());
    }

    public function testGetComment() {
        $expected = new ApiJson();
        $expected->addAlert('error', 'No column found for ID 1.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->comments->getComment(null,
            new ResponseMock(), $args);
        $this->assertEquals($expected, $actual);

        $this->createComment();
        $actual = $this->comments->getComment(null,
            new ResponseMock(), $args);
        $this->assertTrue($actual->status === 'success');
        $this->assertTrue(count($actual->data) === 1);
    }

    public function testAddRemoveComment() {
        $expected = new ApiJson();

        $actual = $this->createComment();

        $expected->setSuccess();
        $expected->addAlert('success', 'Comment added.');

        $this->assertEquals($expected, $actual);

        $expected->addAlert('success', 'Comment removed.');

        $args = [];
        $args['id'] = 1;

        $actual = $this->comments->removeComment(null,
            new ResponseMock(), $args);

        $this->assertEquals($expected, $actual);
    }

    public function testAddBadComment() {
        $request = new RequestMock();
        $request->invalidPayload = true;

        $response = $this->comments->addComment($request,
            new ResponseMock(), null);

        $this->assertTrue($response->status === 'failure');
        $this->assertTrue($response->alerts[0]['type'] === 'error');
    }

    public function testRemoveBadComment() {
        $args = [];
        $args['id'] = 5; // No such comment

        $response = $this->comments->removeComment(null,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'failure');
    }

    public function testUpdateComment() {
        $this->createComment();

        $comment = DataMock::getComment();
        $comment->text = 'updated';

        $args = [];
        $args['id'] = $comment->id;

        $request = new RequestMock();
        $request->payload = $comment;

        $response = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->status === 'success');

        $request->payload = new stdClass();
        $response = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertTrue($response->alerts[2]['type'] === 'error');
    }

    private function createComment() {
        $request = new RequestMock();
        $comment = DataMock::getComment();
        $comment->id = 0;

        $request->payload = $comment;

        $response = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertTrue($response->status === 'success');

        return $response;
    }
}

