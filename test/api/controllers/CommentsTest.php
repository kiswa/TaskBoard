<?php
require_once __DIR__ . '/../Mocks.php';

class CommentsTest extends PHPUnit_Framework_TestCase {
    private $comments;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
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

    public function testGetCommentForbidden() {
        $this->createComment();

        DataMock::createBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $this->comments = new Comments(new ContainerMock());

        $actual = $this->comments->getComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
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

    public function testAddCommentForbidden() {
        $this->createBoard();
        $this->createTask();
        DataMock::createBoardAdminUser();

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $comment = DataMock::getComment();
        $comment->id = 0;

        $request->payload = $comment;

        $this->comments = new Comments(new ContainerMock());

        $actual = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveCommentForbidden() {
        $this->createComment();

        DataMock::createBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $this->comments = new Comments(new ContainerMock());

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveCommentUserSecurity() {
        $this->createComment();

        DataMock::createStandardUser();

        $args = [];
        $args['id'] = 1;

        $this->comments = new Comments(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), $args);

        $this->assertEquals('You do not have sufficient permissions to ' .
            'remove this comment.', $actual->alerts[0]['text']);
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

    public function testUpdateCommentForbidden() {
        $this->createComment();

        DataMock::createBoardAdminUser();

        $comment = DataMock::getComment();
        $comment->text = 'updated';

        $args = [];
        $args['id'] = $comment->id;

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];
        $request->payload = $comment;

        $this->comments = new Comments(new ContainerMock());

        $actual = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateCommentUserSecurity() {
        $this->createComment();
        DataMock::createStandardUser();

        $args = [];
        $args['id'] = 1;

        $comment = DataMock::getComment();
        $comment->text = 'updated';

        $this->comments = new Comments(new ContainerMock());
        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];
        $request->payload = $comment;

        $actual = $this->comments->updateComment($request,
            new ResponseMock(), $args);

        $this->assertEquals('You do not have sufficient permissions to ' .
            'update this comment.', $actual->alerts[0]['text']);
    }

    private function createBoard() {
        $board = DataMock::getBoardForDb();

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

    private function createComment() {
        $this->createBoard();
        $this->createTask();

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

