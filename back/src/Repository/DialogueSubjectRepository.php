<?php

namespace App\Repository;

use App\Entity\DialogueSubject;
use App\Entity\ScriptDialogue;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class DialogueSubjectRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DialogueSubject::class);
    }

    public function save(DialogueSubject $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(DialogueSubject $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?DialogueSubject
    {
        return $this->createQueryBuilder('ds')
            ->where('ds.uuid = :uuid')
            ->andWhere('ds.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return DialogueSubject[]
     */
    public function getByScriptDialogueAndUserOrderedByPosition(ScriptDialogue $scriptDialogue, User $user): array
    {
        return $this->createQueryBuilder('ds')
            ->where('ds.scriptDialogue = :scriptDialogue')
            ->andWhere('ds.user = :user')
            ->setParameter('scriptDialogue', $scriptDialogue)
            ->setParameter('user', $user)
            ->orderBy('ds.position', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptDialogue(ScriptDialogue $scriptDialogue): int
    {
        $result = $this->createQueryBuilder('ds')
            ->select('MAX(ds.position)')
            ->where('ds.scriptDialogue = :scriptDialogue')
            ->setParameter('scriptDialogue', $scriptDialogue)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) ($result ?? -1);
    }
}
