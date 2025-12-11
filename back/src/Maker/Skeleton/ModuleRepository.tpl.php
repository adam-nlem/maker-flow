<?= "<?php\n" ?>

namespace <?= $namespace ?>;

use App\Module\<?= $moduleName ?>\Entity\<?= $moduleName . $entity ?>;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;

class <?= $moduleName . $entity ?>Repository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, <?= $moduleName . $entity ?>::class);
    }

    public function save(<?= $moduleName . $entity ?> $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(<?= $moduleName . $entity ?> $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    // Add custom queries here if needed
}
