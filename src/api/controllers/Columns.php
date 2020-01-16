<?php
use RedBeanPHP\R;

class Columns extends BaseController {

  public function getColumn($request, $response, $args) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::USER);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $column = R::load('column', (int)$args['id']);

    if ((int)$column->id === 0) {
      $this->logger->addError('Attempt to load column ' .
        $args['id'] . ' failed.');
      $this->apiJson->addAlert('error', 'No column found for ID ' .
        $args['id'] . '.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($column->board_id, $request)) {
      return $this->jsonResponse($response, 403);
    }

    $this->apiJson->setSuccess();
    $this->apiJson->addData(R::exportAll($column));

    return $this->jsonResponse($response);
  }

  public function addColumn($request, $response) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::BOARD_ADMIN);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $column = R::dispense('column');
    if (!BeanLoader::LoadColumn($column, $request->getBody())) {
      $column->board_id = 0;
    }

    $board = R::load('board', $column->board_id);

    if ((int)$board->id === 0) {
      $this->logger->addError('Add Column: ', [$column]);
      $this->apiJson->addAlert('error', 'Error adding column. ' .
        'Please try again.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($column->board_id, $request)) {
      return $this->jsonResponse($response, 403);
    }

    R::store($column);

    $actor = R::load('user', Auth::GetUserId($request));
    $this->dbLogger->logChange($actor->id,
      $actor->username . ' added column ' . $column->name . '.',
      '', json_encode($column), 'column', $column->id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', 'Column ' .
      $column->name . ' added.');

    return $this->jsonResponse($response);
  }

  public function updateColumn($request, $response, $args) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::BOARD_ADMIN);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $data = json_decode($request->getBody());

    if (is_null($args) || !array_key_exists('id', $args)) {
      $this->logger->addError('Update Task: ', [$data]);
      $this->apiJson->addAlert('error', 'Error updating task. Please try again.');

      return $this->jsonResponse($response);
    }

    $column = R::load('column', (int)$args['id']);

    $update = R::dispense('column');
    $update->id = BeanLoader::LoadColumn($update, $request->getBody())
      ? $column->id
      : 0;

    if ($column->id === 0 || (int)$column->id !== (int)$update->id) {
      $this->logger->addError('Update Column: ', [$column, $update]);
      $this->apiJson->addAlert('error', 'Error updating column ' .
        $update->name . '. Please try again.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($column->board_id, $request)) {
      return $this->jsonResponse($response, 403);
    }

    R::store($update);

    $actor = R::load('user', Auth::GetUserId($request));
    $this->dbLogger->logChange($actor->id,
      $actor->username . ' updated column ' . $update->name,
      json_encode($column), json_encode($update),
      'column', $update->id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success', 'Column ' .
      $update->name . ' updated.');
    $this->apiJson->addData(R::exportAll($update));

    return $this->jsonResponse($response);
  }

  public function removeColumn($request, $response, $args) {
    $status = $this->secureRoute($request, $response,
      SecurityLevel::BOARD_ADMIN);
    if ($status !== 200) {
      return $this->jsonResponse($response, $status);
    }

    $id = (int)$args['id'];
    $column = R::load('column', $id);

    if ((int)$column->id !== $id) {
      $this->logger->addError('Remove Column: ', [$column]);
      $this->apiJson->addAlert('error', 'Error removing column. ' .
        'No column found for ID ' . $id . '.');

      return $this->jsonResponse($response);
    }

    if (!$this->checkBoardAccess($column->board_id, $request)) {
      return $this->jsonResponse($response, 403);
    }

    $before = $column;
    R::trash($column);

    $actor = R::load('user', Auth::GetUserId($request));
    $this->dbLogger->logChange($actor->id,
      $actor->username . ' removed column ' . $before->name,
      json_encode($before), '', 'column', $id);

    $this->apiJson->setSuccess();
    $this->apiJson->addAlert('success',
      'Column ' . $before->name . ' removed.');

    return $this->jsonResponse($response);
  }
}

