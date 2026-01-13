<?= "<?php\n" ?>

namespace <?= $namespace ?>;

use App\Entity\User;
use App\Module\<?= $moduleName ?>\Service\<?= $moduleName . $entity ?>Service;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/<?= $moduleNameDash ?>/<?= $entityKebabPlural ?>')]
class <?= $moduleName . $entity ?>Controller extends AbstractController
{
    public function __construct(private <?= $moduleName . $entity ?>Service $service)
    {
    }

    #[Route('', name: 'api_modules_<?= $moduleNameSnake ?>_<?= $entitySnakePlural ?>_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_<?= $moduleNameSnake ?>_<?= $entitySnakePlural ?>_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{<?= $entityCamel ?>Uuid}', name: 'api_modules_<?= $moduleNameSnake ?>_<?= $entitySnakePlural ?>_show', methods: ['GET'])]
    public function show(string $<?= $entityCamel ?>Uuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{<?= $entityCamel ?>Uuid}', name: 'api_modules_<?= $moduleNameSnake ?>_<?= $entitySnakePlural ?>_update', methods: ['PATCH'])]
    public function update(string $<?= $entityCamel ?>Uuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{<?= $entityCamel ?>Uuid}', name: 'api_modules_<?= $moduleNameSnake ?>_<?= $entitySnakePlural ?>_delete', methods: ['DELETE'])]
    public function delete(string $<?= $entityCamel ?>Uuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
