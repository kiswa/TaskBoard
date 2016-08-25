<?php
require_once __DIR__ . '/../Mocks.php';

class CategoryTest extends PHPUnit_Framework_TestCase {
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

        $category = DataMock::getCategory();
        $this->json = json_encode($category);
        $this->bean = $category;
    }

    public function testCreateCategory() {
        $category = new Category(new ContainerMock());
        $this->assertDefaultProperties($category);
    }

    public function testSaveCategory() {
        $category = new Category(new ContainerMock());
        $this->assertTrue($category->save());
    }

    public function testLoadFromBean() {
        $category = new Category(new ContainerMock());

        $category->loadFromBean(null);
        $this->assertDefaultProperties($category);

        $category->loadFromBean($this->bean);
        $this->assertMockProperties($category);
    }

    public function testLoadFromJson() {
        $category = new Category(new ContainerMock());

        $category->loadFromJson('');
        $this->assertDefaultProperties($category);

        $category->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($category);

        $category->loadFromJson($this->json);
        $this->assertMockProperties($category);
    }

    public function testUpdateBean() {
        $category = new Category(new ContainerMock());
        $category->loadFromBean($this->bean);

        $category->updateBean();
        $bean = $category->getBean();

        $this->assertEquals($bean->id, $category->id);
        $this->assertEquals($bean->name, $category->name);
        $this->assertEquals($bean->default_task_color,
            $category->default_task_color);
        $this->assertEquals($bean->board_id, $category->board_id);
    }

    private function assertDefaultProperties($category) {
        $this->assertEquals(0, $category->id);
        $this->assertEquals('', $category->name);
        $this->assertEquals('', $category->default_task_color);
        $this->assertEquals(0, $category->board_id);
    }

    private function assertMockProperties($category) {
        $this->assertEquals(1, $category->id);
        $this->assertEquals('cat1', $category->name);
        $this->assertEquals('#ffffe0', $category->default_task_color);
        $this->assertEquals(1, $category->board_id);
    }
}

