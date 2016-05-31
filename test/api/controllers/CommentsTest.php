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

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->comments = new Comments(new ContainerMock());
    }

    public function testGetComment() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->comments->getComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('No comment found for ID 1.',
            $actual->alerts[0]['text']);

        $this->createComment();

        $this->comments = new Comments(new ContainerMock());
        $request->header = [DataMock::getJwt()];

        $actual = $this->comments->getComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetCommentUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->comments->getComment($request,
            new ResponseMock(), null);

        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }


    public function testAddRemoveComment() {
        $actual = $this->createComment();
        $this->comments = new Comments(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), $args);

        $this->assertEquals('Comment removed.', $actual->alerts[0]['text']);
    }

    public function testAddRemoveCommentUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $comment = DataMock::getComment();
        $comment->id = 0;

        $request->payload = $comment;

        $actual = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);

        $args = [];
        $args['id'] = 1;

        $request->header = [DataMock::getJwt(2)];

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }


    public function testAddRemoveBadComment() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::getJwt()];

        $response = $this->comments->addComment($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('error', $response->alerts[0]['type']);

        $this->comments = new Comments(new ContainerMock());
        $request->header = [DataMock::getJwt()];

        $args = [];
        $args['id'] = 5; // No such comment

        $response = $this->comments->removeComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testUpdateComment() {
        $this->createComment();
        $this->comments = new Comments(new ContainerMock());

        $comment = DataMock::getComment();
        $comment->text = 'updated';

        $args = [];
        $args['id'] = $comment->id;

        $request = new RequestMock();
        $request->payload = $comment;
        $request->header = [DataMock::getJwt()];

        $response = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);

        $this->comments = new Comments(new ContainerMock());
        $request->payload = new stdClass();
        $request->header = [DataMock::getJwt()];

        $response = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testUpdateCommentUnprivileged() {
        $res = DataMock::createUnpriviligedUser();
        $this->assertEquals('success', $res->status);

        $this->createComment();
        $this->comments = new Comments(new ContainerMock());

        $comment = DataMock::getComment();
        $comment->text = 'updated';

        $args = [];
        $args['id'] = $comment->id;

        $request = new RequestMock();
        $request->payload = $comment;
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    private function createComment() {
        $request = new RequestMock();
        $comment = DataMock::getComment();
        $comment->id = 0;

        $request->payload = $comment;
        $request->header = [DataMock::getJwt()];

        $response = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $response->status);

        return $response;
    }
}

