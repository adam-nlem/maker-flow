<?= "<?php\n" ?>

namespace <?= $namespace ?>;

use App\Module\<?= $moduleName ?>\Service\<?= $moduleName . $entity ?>Service;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/<?= $moduleNameDash ?>/<?= $entityKebab ?>', name: 'api_module_<?= $moduleNameSnake ?>_<?= $entitySnake ?>_')]
class <?= $moduleName . $entity ?>Controller extends AbstractController
{
    public function __construct(private <?= $moduleName . $entity ?>Service $service) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list() {}

    #[Route('', name: 'create', methods: ['POST'])]
    public function create() {}

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(int $id) {}

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $id) {}

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id) {}
}
