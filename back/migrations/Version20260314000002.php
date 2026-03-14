<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create Onboarding table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE onboarding (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, completed_steps JSON NOT NULL, dismissed_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_23A7BB0EA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE onboarding ADD CONSTRAINT FK_23A7BB0EA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE onboarding DROP FOREIGN KEY FK_23A7BB0EA76ED395');
        $this->addSql('DROP TABLE onboarding');
    }
}
