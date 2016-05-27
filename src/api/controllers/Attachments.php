<?php
use RedBeanPHP\R;

class Attachments extends BaseController {

    public function getAttachment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $attachment = new Attachment($this->container, (int)$args['id']);

        if ($attachment->id === 0) {
            $this->logger->addError('Attempt to load attachment ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No attachment found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($attachment);

        return $this->jsonResponse($response);
    }

    public function addAttachment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $attachment = new Attachment($this->container);
        $attachment->loadFromJson($request->getBody());

        if (!$attachment->save()) {
            $this->logger->addError('Add Attachment: ', [$attachment]);
            $this->apiJson->addAlert('error', 'Error adding attachment. ' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        $actor = new User($this->container, Auth::GetUserId($request));
        $this->dbLogger->logChange($this->container, 0,
            '$user->name added attachment.', '', json_encode($attachment),
            'attachment', $attachment->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Attachment added.');

        return $this->jsonResponse($response);
    }

    public function removeAttachment($request, $response, $args) {
        $status = $this->secureRoute($request, $response,
            SecurityLevel::User);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $actor = new User($this->container, Auth::GetUserId($request));

        $id = (int)$args['id'];
        $attachment = new Attachment($this->container, $id);

        // If User level, only the user that created the attachment
        // may delete it. If higher level, delete is allowed.
        if ($actor->security_level->getValue() === SecurityLevel::User) {
            if ($actor->id !== $attachment->user_id) {
                $this->apiJson->addAlert('error',
                    'You do not have sufficient permissions ' .
                    'to remove this attachment.');

                return $this->jsonResponse($response);
            }
        } // @codeCoverageIgnore

        if ($attachment->id !== $id) {
            $this->logger->addError('Remove Attachment: ', [$attachment]);
            $this->apiJson->addAlert('error', 'Error removing attachment. ' .
                'No attachment found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $before = $attachment;
        $attachment->delete();

        $this->dbLogger->logChange($this->container, $actor->id,
            $actor->username .' removed attachment ' . $before->name,
            json_encode($before), '', 'attachment', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Attachment ' . $before->name . ' removed.');

        return $this->jsonResponse($response);
    }
}

