<?= "<?php\n" ?>

namespace <?= $namespace ?>;

use App\Module\<?= $moduleName ?>\Service\<?= $moduleName . $entity ?>Service;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;

#[Route('/api/modules/<?= $moduleNameDash ?>/<?= $entityKebab ?>', name: 'api_module_<?= $moduleNameSnake ?>_<?= $entitySnake ?>_')]
class <?= $moduleName . $entity ?>Controller extends AbstractController
{
    public function __construct(private <?= $moduleName . $entity ?>Service $service) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list() {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create() {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{uuid}', name: 'show', methods: ['GET'])]
    public function show(string $uuid) {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{uuid}', name: 'update', methods: ['PUT'])]
    public function update(string $uuid) {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{uuid}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $uuid) {
        /** @var User $user */
        $user = $this->getUser();
    }
}
