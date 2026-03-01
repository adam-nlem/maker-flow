<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260228161938 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE script_hook (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_64E23101A1C01850 (script_id), INDEX IDX_64E23101A76ED395 (user_id), INDEX IDX_64E2310111CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E23101A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E23101A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E2310111CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script DROP FOREIGN KEY `FK_1C81873AA39EFAE8`');
        $this->addSql('DROP INDEX IDX_1C81873AA39EFAE8 ON script');
        $this->addSql('ALTER TABLE script DROP hook, DROP hook_template_id');
        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY `FK_B4C06FFCA76ED395`');
        $this->addSql('DROP TABLE hook_template');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE hook_template (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, title VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, is_public TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, INDEX IDX_B4C06FFCA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT `FK_B4C06FFCA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E23101A1C01850');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E23101A76ED395');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E2310111CE609');
        $this->addSql('DROP TABLE script_hook');
        $this->addSql('ALTER TABLE script ADD hook LONGTEXT DEFAULT NULL, ADD hook_template_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script ADD CONSTRAINT `FK_1C81873AA39EFAE8` FOREIGN KEY (hook_template_id) REFERENCES hook_template (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_1C81873AA39EFAE8 ON script (hook_template_id)');
    }
}
