<?php
use RedBeanPHP\R;

class Boards extends BaseController {

  public function getAllBoards($request, $response) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $boards = $this->loadAllBoards($request);

    if (!count($boards)) {
      $this->apiJson->addAlert('info', $this->strings->api_noBoards);

      return $this->jsonResponse($response);
    }

    $this->apiJson->setSuccess();
    $this->apiJson->addData($boards);

    return $this->jsonResponse($response);
  }

  public function getBoard($request, $response, $args) {
    $status = $this->secureRoute($request, $response, SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $board = R::load('board', (int)$args['id']);

    if ($board->id === 0) {
      $this->logger->error('Attempt to load board ' . $args['id'] .
        ' failed.');
      $this->apiJson->addAlert('error', $this->strings->api_noBoardId .
        $args['id'] . '.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($board->id, $request)) {
      return $this->jsonResponse($response, 403);
    }

    $this->cleanBoard($board);
    $this->apiJson->setSuccess();
    $this->apiJson->addData(R::exportAll($board));

    return $this->jsonResponse($response);
  }

  public function addBoard($request, $response) {
    $status = $this->secureRoute($request, $response, SecurityLevel::ADMIN);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $board = R::dispense('board');
    if (!BeanLoader::LoadBoard($board, $request->getBody())) {
      $board->id = -1;
    }

    $this->includeAdmins($board);

    if ($board->id === -1) {
      $this->logger->error('Add Board: ', [$board]);
      $this->apiJson->addAlert('error', $this->strings->api_boardError);

      return $this->jsonResponse($response);
    }

    R::store($board);

    $actor = R::load('user', Auth::GetUserId($request));
    $this->dbLogger->logChange($actor->id,
      $actor->username . ' added board ' . $board->name . '.',
      '', json_encode($board), 'board', $board->id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', $this->strings->api_boardAdded .
      '(' . $board->name . ').');
    $this->apiJson->addData($this->loadAllBoards($request));

    return $this->jsonResponse($response);
  }

  public function updateBoard($request, $response, $args) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::BOARD_ADMIN);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $data = json_decode($request->getBody());

    if (is_null($args) || !array_key_exists('id', $args)) {
      $this->logger->error('Update Board: ', [$data]);
      $this->apiJson->addAlert('error', $this->strings->api_boardUpdateError);

      return $this->jsonResponse($response);
    }

    $board = R::load('board', (int)$args['id']);

    if (!$this->checkBoardAccess($board->id, $request)) {
      return $this->jsonResponse($response, 403);
    }

    $update = R::load('board', (int)$args['id']);
    $update->id = BeanLoader::LoadBoard($update, $request->getBody())
      ? $board->id : 0;

    if ($update->id === 0 || ($board->id !== $update->id)) {
      $this->logger->error('Update Board: ', [$board, $update]);
      $this->apiJson->addAlert('error', $this->strings->api_boardUpdateError);

      return $this->jsonResponse($response);
    }

    $this->includeAdmins($update);
    R::store($update);

    $actor = R::load('user', Auth::GetUserId($request));
    $this->dbLogger->logChange($actor->id,
      $actor->username . ' updated board ' . $update->name,
      json_encode(R::exportAll($board)),
      json_encode(R::exportAll($update)), 'board', $update->id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', $this->strings->api_boardUpdated .
      '(' . $update->name . ').');
    $this->apiJson->addData($this->loadAllBoards($request));

    return $this->jsonResponse($response);
  }

  public function removeBoard($request, $response, $args) {
    $status = $this->secureRoute($request, $response, SecurityLevel::ADMIN);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $id = (int)$args['id'];
    $board = R::load('board', $id);

    if ((int)$board->id !== $id) {
      $this->logger->error('Remove Board: ', [$board]);
      $this->apiJson->addAlert('error', $this->strings->api_boardRemoveError .
        $id  . '.');

      return $this->jsonResponse($response);
    }

    $before = $board;
    R::trash($board);

    $actor = R::load('user', Auth::GetUserId($request));
    $this->dbLogger->logChange($actor->id,
      $actor->username . ' removed board ' . $before->name,
      json_encode($before), '', 'board', $id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', $this->strings->api_boardRemoved .
      '(' . $before->name . ').');
    $this->apiJson->addData($this->loadAllBoards($request));

    return $this->jsonResponse($response);
  }

  private function includeAdmins($board) {
    $admins = R::findAll('user', ' WHERE security_level = 1 ');

    foreach ($admins as $admin) {
      if (!in_array($admin, $board->sharedUserList)) {
        $board->sharedUserList[] = $admin;
      }
    }
  }

  private function loadAllBoards($request) {
    $boards = [];
    $boardBeans = R::findAll('board');

    if (count($boardBeans)) {
      foreach ($boardBeans as $bean) {
        if (Auth::HasBoardAccess($request, $bean->id)) {
          $this->cleanBoard($bean);
          $boards[] = $bean;
        }
      }
    }

    return R::exportAll($boards);
  }

  private function cleanBoard(&$board) {
    foreach ($board->sharedUserList as $user) {
      $user = $this->cleanUser($user);
    }

    foreach ($board->xownColumnList as $column) {
      foreach ($column->xownTaskList as $task) {
        foreach ($task->sharedUserList as $user) {
          $user = $this->cleanUser($user);
        }
      }
    }
  }

  private function cleanUser($user) {
    unset($user->password_hash);
    unset($user->active_token);

    return $user;
  }
}

