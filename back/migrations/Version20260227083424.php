<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260227083424 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE script_call_to_action (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, call_to_action_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_AF7D2479A1C01850 (script_id), INDEX IDX_AF7D2479A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_retention_cue (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, retention_cue_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_836438FDA1C01850 (script_id), INDEX IDX_836438FDA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT FK_AF7D2479A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT FK_AF7D2479A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT FK_836438FDA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT FK_836438FDA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY FK_AF7D2479A1C01850');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY FK_AF7D2479A76ED395');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY FK_836438FDA1C01850');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY FK_836438FDA76ED395');
        $this->addSql('DROP TABLE script_call_to_action');
        $this->addSql('DROP TABLE script_retention_cue');
    }
}
