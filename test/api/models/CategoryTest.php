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

        $task = DataMock::getCategory();
        $this->json = json_encode($task);
        $this->bean = $task;
    }

    public function testCreateCategory() {
        $category = new Category(new ContainerMock());
        $this->assertDefaultProperties($category);
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

        $this->assertTrue($bean->id === $category->id);
        $this->assertTrue($bean->name === $category->name);
    }

    private function assertDefaultProperties($category) {
        $this->assertTrue($category->id === 0);
        $this->assertTrue($category->name === '');
    }

    private function assertMockProperties($category) {
        $this->assertTrue($category->id === 1);
        $this->assertTrue($category->name === 'cat1');
    }
}

