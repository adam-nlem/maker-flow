<?= "<?php\n" ?>

namespace <?= $namespace ?>;

use App\Module\<?= $moduleName ?>\Service\<?= $moduleName ?>ModuleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/<?= $moduleNameDash ?>', name: 'api_module_<?= $moduleNameSnake ?>_')]
class <?= $moduleName ?>ModuleController extends AbstractController
{
    public function __construct(
        private readonly <?= $moduleName ?>ModuleService $service,
    ) {
    }

    #[Route('/', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        // TODO: call service etc.
        return $this->json();
    }
}
