<?php
require_once __DIR__ . '/../Mocks.php';
use RedBeanPHP\R;

class CommentsTest extends PHPUnit\Framework\TestCase {
    private $comments;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) {
        }
    }

    public function setUp() {
        R::nuke();
        Auth::CreateInitialAdmin(new ContainerMock());

        $this->comments = new Comments(new ContainerMock());
    }

    public function testGetComment() {
        $this->createComment();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->comments->getComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
        $this->assertEquals(2, count($actual->data));
    }

    public function testGetCommentNotFound() {
        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $args = [];
        $args['id'] = 1;

        $actual = $this->comments->getComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('No comment found for ID 1.',
            $actual->alerts[0]['text']);
    }

    public function testGetCommentForbidden() {
        $this->createComment();
        DataMock::CreateBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $this->comments = new Comments(new ContainerMock());

        $actual = $this->comments->getComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testGetCommentUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->comments->getComment($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddComment() {
        $this->createComment();
        $data = $this->getCommentData();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $data;

        $actual = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $actual->status);
    }

    public function testAddCommentUnprivileged() {
        DataMock::CreateUnprivilegedUser();
        $comment = $this->getCommentData();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];
        $request->payload = $comment;

        $actual = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testAddCommentInvalid() {
        $request = new RequestMock();
        $request->invalidPayload = true;
        $request->header = [DataMock::GetJwt()];

        $actual = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertEquals('failure', $actual->status);
        $this->assertEquals('error', $actual->alerts[0]['type']);
    }

    public function testAddCommentForbidden() {
        $this->createComment();
        DataMock::createBoardAdminUser();
        $comment = $this->getCommentData();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];
        $request->payload = $comment;

        $actual = $this->comments->addComment($request,
            new ResponseMock(), null);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateComment() {
        $this->createComment();

        $comment = $this->getCommentData();
        $comment->id = 1;
        $comment->text = 'updated';

        $args = [];
        $args['id'] = $comment->id;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->payload = $comment;

        $response = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $response->status);
    }

    public function testUpdateCommentInvalid() {
        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];
        $request->invalidPayload = true;

        $response = $this->comments->updateComment($request,
            new ResponseMock(), null);
        $this->assertEquals('error', $response->alerts[0]['type']);
    }

    public function testUpdateCommentUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->comments->updateComment($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateCommentForbidden() {
        $this->createComment();
        DataMock::createBoardAdminUser();

        $comment = $this->getCommentData();
        $comment->id = 1;
        $comment->text = 'updated';

        $args = [];
        $args['id'] = $comment->id;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];
        $request->payload = $comment;

        $actual = $this->comments->updateComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testUpdateCommentUserSecurity() {
        $this->createComment();
        DataMock::CreateStandardUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->comments->updateComment($request,
            new ResponseMock(), $args);

        $this->assertEquals('You do not have sufficient permissions to ' .
            'update this comment.', $actual->alerts[0]['text']);
    }

    public function testRemoveComment() {
        $this->createComment();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('success', $actual->status);
    }

    public function testRemoveCommentUnprivileged() {
        DataMock::CreateUnprivilegedUser();

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), null);
        $this->assertEquals('Insufficient privileges.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveCommentInvalid() {
        $request = new RequestMock();
        $request->header = [DataMock::GetJwt()];

        $args = [];
        $args['id'] = 1; // No such comment

        $response = $this->comments->removeComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('failure', $response->status);
    }

    public function testRemoveCommentForbidden() {
        $this->createComment();
        DataMock::CreateBoardAdminUser();

        $args = [];
        $args['id'] = 1;

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), $args);
        $this->assertEquals('Access restricted.',
            $actual->alerts[0]['text']);
    }

    public function testRemoveCommentUserSecurity() {
        $this->createComment();
        DataMock::CreateStandardUser();

        $args = [];
        $args['id'] = 1;

        $this->comments = new Comments(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::GetJwt(2)];

        $actual = $this->comments->removeComment($request,
            new ResponseMock(), $args);

        $this->assertEquals('You do not have sufficient permissions to ' .
            'remove this comment.', $actual->alerts[0]['text']);
    }


    private function getCommentData() {
        $data = new stdClass();

        $data->text = 'test comment';
        $data->user_id = 1;
        $data->task_id = 1;
        $data->timestamp = time();

        return $data;
    }

    private function createComment() {
        $comment = R::dispense('comment');
        R::store($comment);

        $task = R::dispense('task');
        $task->xownCommentList[] = $comment;

        $column = R::dispense('column');
        $column->xownTaskList[] = $task;

        $admin = R::load('user', 1);
        $board = R::dispense('board');
        $board->xownColumnList[] = $column;
        $board->sharedUserList[] = $admin;

        R::store($board);
    }
}

