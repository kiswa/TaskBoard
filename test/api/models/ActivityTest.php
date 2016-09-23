<?php
require_once __DIR__ . '/../Mocks.php';

class ActivityTest extends PHPUnit_Framework_TestCase {
    private $json = '';
    private $bean;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    protected function setUp() {
        RedBeanPHP\R::nuke();

        if ($this->json !== '') {
            return;
        }

        $activity = DataMock::getActivity();
        $this->json = json_encode($activity);
        $this->bean = $activity;
    }

    public function testCreateActivity() {
        $activity = new Activity(new ContainerMock());
        $this->assertDefaultProperties($activity);
    }

    public function testCreateFromBean() {
        $activity = Activity::fromBean(new ContainerMock(), null);
        $this->assertDefaultProperties($activity);

        $activity = Activity::fromBean(new ContainerMock(), $this->bean);
        $this->assertMockProperties($activity);
    }

    public function testLoadFromJson() {
        $activity = new Activity(new ContainerMock());

        $activity->loadFromJson('');
        $this->assertDefaultProperties($activity);

        $activity->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($activity);

        $activity->loadFromJson($this->json);
        $this->assertMockProperties($activity);
    }

    private function assertMockProperties($activity) {
        $this->assertEquals(1, $activity->id);
        $this->assertEquals(1, $activity->user_id);
        $this->assertEquals('Log test.', $activity->log_text);
        $this->assertEquals('', $activity->before);
        $this->assertEquals('', $activity->after);
        $this->assertEquals('test', $activity->item_type);
        $this->assertEquals(1, $activity->item_id);
    }

    private function assertDefaultProperties($activity) {
        $this->assertEquals(0, $activity->id);
        $this->assertEquals(0, $activity->user_id);
        $this->assertEquals('', $activity->log_text);
        $this->assertEquals('', $activity->before);
        $this->assertEquals('', $activity->after);
        $this->assertEquals('', $activity->item_type);
        $this->assertEquals(0, $activity->item_id);
    }
}

