<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260415052739 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename post_insight type "saved" to "saves"';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE post_insight SET type = 'saves' WHERE type = 'saved'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE post_insight SET type = 'saved' WHERE type = 'saves'");
    }
}
