<?php
class Invalid extends BaseController {

    public function noApi($request, $response) {
        $request; // Not used, but required for Slim Framework
        $this->apiJson->addAlert('error',
            'No API functionality at this endpoint.');

        $apiReturn = new stdClass();
        $apiReturn->status = 'One of "success" or "failure".';
        $apiReturn->data = 'An array of data (JSON objects and/or arrays). ' .
            'The first object is a new JWT for the next request.';
        $apiReturn->alerts = 'An array of alerts, with "type" of "success", ' .
            '"error", "warn", or "info" and a "text" message.';

        $this->apiJson->addData($apiReturn);

        return $this->jsonResponse($response);
    }

}

