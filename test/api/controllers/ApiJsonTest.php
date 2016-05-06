<?php
class ApiJsonTest extends PHPUnit_Framework_TestCase {
    public function testCreateApiJson() {
        $apiJson = new ApiJson();

        $this->assertTrue($apiJson->status === 'failure');
        $this->assertArraySubset($apiJson->data, []);
        $this->assertArraySubset($apiJson->alerts, []);
    }

    public function testSetSuccess() {
        $apiJson = new ApiJson();
        $this->assertTrue($apiJson->status === 'failure');

        $apiJson->setSuccess();
        $this->assertTrue($apiJson->status === 'success');
    }

    public function testSetFailure() {
        $apiJson = new ApiJson();
        $apiJson->setSuccess();
        $this->assertTrue($apiJson->status === 'success');

        $apiJson->setFailure();
        $this->assertTrue($apiJson->status === 'failure');
    }

    public function testAddData() {
        $apiJson = new ApiJson();

        $obj = new stdClass();
        $obj->id = 1;

        $apiJson->addData($obj);
        $this->assertArraySubset($apiJson->data, [$obj]);
    }

    public function testAddAlert() {
        $apiJson = new ApiJson();

        $alert = new stdClass();
        $alert->type = 'success';
        $alert->text = 'Test message.';

        $this->assertArraySubset($apiJson->alerts, [$alert]);
    }
}

