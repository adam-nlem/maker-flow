<?= "<?php\n" ?>

namespace <?= $namespace ?>;

use App\Entity\User;

class <?= $moduleName ?>ModuleService
{
    public function getWidgetData(?User $user = null): array
    {
        // TODO: implement real logic
        return [
            'module' => '<?= $moduleName ?>',
            'userId' => $user?->getId(),
        ];
    }
}
