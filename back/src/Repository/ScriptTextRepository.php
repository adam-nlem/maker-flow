<?php

namespace App\Repository;

use App\Entity\Script;
use App\Entity\ScriptGeneration;
use App\Entity\ScriptText;
use App\Entity\ScriptVersion;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class ScriptTextRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScriptText::class);
    }

    public function save(ScriptText $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ScriptText $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?ScriptText
    {
        return $this->createQueryBuilder('st')
            ->where('st.uuid = :uuid')
            ->andWhere('st.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    /**
     * @return ScriptText[]
     */
    public function getByScriptUserAndGenerationOrderedByPosition(Script $script, User $user, ?ScriptGeneration $generation): array
    {
        $qb = $this->createQueryBuilder('st')
            ->where('st.script = :script')
            ->andWhere('st.user = :user')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('st.position', 'ASC');

        if ($generation !== null) {
            $qb->andWhere('st.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('st.scriptGeneration IS NULL');
        }

        return $qb->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getMaxPositionByScriptAndGeneration(Script $script, ?ScriptGeneration $generation): int
    {
        $qb = $this->createQueryBuilder('st')
            ->select('MAX(st.position)')
            ->where('st.script = :script')
            ->setParameter('script', $script);

        if ($generation !== null) {
            $qb->andWhere('st.scriptGeneration = :generation')
               ->setParameter('generation', $generation);
        } else {
            $qb->andWhere('st.scriptGeneration IS NULL');
        }

        $result = $qb->getQuery()->getSingleScalarResult();

        return (int) ($result ?? -1);
    }

    public function deleteByGeneration(ScriptGeneration $generation): void
    {
        $this->createQueryBuilder('st')
            ->delete()
            ->where('st.scriptGeneration = :generation')
            ->setParameter('generation', $generation)
            ->getQuery()
            ->execute();
    }

    /**
     * @return ScriptText[]
     */
    public function getByScriptAndUserMainParts(Script $script, User $user): array
    {
        return $this->createQueryBuilder('st')
            ->where('st.script = :script')
            ->andWhere('st.user = :user')
            ->andWhere('st.scriptVersion IS NULL')
            ->setParameter('script', $script)
            ->setParameter('user', $user)
            ->orderBy('st.position', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function deleteMainPartsByScript(Script $script): void
    {
        $this->createQueryBuilder('st')
            ->delete()
            ->where('st.script = :script')
            ->andWhere('st.scriptVersion IS NULL')
            ->setParameter('script', $script)
            ->getQuery()
            ->execute();
    }

    public function promoteVersionPartsToMain(ScriptVersion $scriptVersion): void
    {
        $this->getEntityManager()->getConnection()->executeStatement(
            'UPDATE script_text SET script_version_id = NULL WHERE script_version_id = :versionId',
            ['versionId' => $scriptVersion->getId()],
        );
    }

    public function existsByScriptVersion(ScriptVersion $scriptVersion): bool
    {
        return (int) $this->createQueryBuilder('st')
            ->select('COUNT(st.id)')
            ->where('st.scriptVersion = :version')
            ->setParameter('version', $scriptVersion)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }
}
