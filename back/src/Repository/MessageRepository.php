<?php

namespace App\Repository;

use App\Entity\Chat;
use App\Entity\Message;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;

class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    public function save(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByChatPaginated(Chat $chat, int $page, int $limit): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.chat = :chat')
            ->setParameter('chat', $chat)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getResult(Query::HYDRATE_SIMPLEOBJECT);
    }

    public function getByUuidAndChat(string $uuid, Chat $chat): ?Message
    {
        return $this->createQueryBuilder('m')
            ->where('m.uuid = :uuid')
            ->andWhere('m.chat = :chat')
            ->setParameter('uuid', $uuid)
            ->setParameter('chat', $chat)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
