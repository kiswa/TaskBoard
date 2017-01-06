<?php
require_once __DIR__ . '/../Mocks.php';

class InvalidTest extends PHPUnit_Framework_TestCase {
    public function testCreateInvalid() {
        $invalid = new Invalid(new ContainerMock());
        $expected = new ApiJson();

        $data = new stdClass();
        $data->status = 'One of "success" or "failure".';
        $data->data = 'An array of data (JSON objects and/or arrays).' .
            'The first object is a new JWT for the next request.';
        $data->alerts = 'An array of alerts, with "type" of "success", ' .
            '"error", "warn", or "info" and a "text" message.';

        $expected->addAlert('error',
            'No API functionality at this endpoint.');
        $expected->addData($data);

        $actual = $invalid->noApi(new RequestMock(), new ResponseMock, null);
        $this->assertEquals($expected, $actual);
    }
}

