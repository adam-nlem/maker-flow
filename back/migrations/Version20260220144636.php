<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260220144636 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE dialogue_subject (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, speaker VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_dialogue_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_7F052FB81BABB360 (script_dialogue_id), INDEX IDX_7F052FB8A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, hook LONGTEXT DEFAULT NULL, published_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, project_id INT NOT NULL, post_group_id INT DEFAULT NULL, INDEX IDX_1C81873AA76ED395 (user_id), INDEX IDX_1C81873A166D1F9C (project_id), UNIQUE INDEX UNIQ_1C81873A41B950E6 (post_group_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_script_tag (script_id INT NOT NULL, script_tag_id INT NOT NULL, INDEX IDX_F4FA8F0CA1C01850 (script_id), INDEX IDX_F4FA8F0CDA0E2BEB (script_tag_id), PRIMARY KEY (script_id, script_tag_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_chapter (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, chapter_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_A4897264A1C01850 (script_id), INDEX IDX_A4897264A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_dialogue (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_67DEBC70A1C01850 (script_id), INDEX IDX_67DEBC70A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_shot (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, shot_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_6BBDFAEFA1C01850 (script_id), INDEX IDX_6BBDFAEFA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_tag (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, color VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_3974EFCA76ED395 (user_id), INDEX IDX_3974EFC166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_voice_over (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, voice_over_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_6E524572A1C01850 (script_id), INDEX IDX_6E524572A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE dialogue_subject ADD CONSTRAINT FK_7F052FB81BABB360 FOREIGN KEY (script_dialogue_id) REFERENCES script_dialogue (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE dialogue_subject ADD CONSTRAINT FK_7F052FB8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script ADD CONSTRAINT FK_1C81873AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script ADD CONSTRAINT FK_1C81873A166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script ADD CONSTRAINT FK_1C81873A41B950E6 FOREIGN KEY (post_group_id) REFERENCES post_group (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE script_script_tag ADD CONSTRAINT FK_F4FA8F0CA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_script_tag ADD CONSTRAINT FK_F4FA8F0CDA0E2BEB FOREIGN KEY (script_tag_id) REFERENCES script_tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT FK_A4897264A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT FK_A4897264A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT FK_67DEBC70A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT FK_67DEBC70A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT FK_6BBDFAEFA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT FK_6BBDFAEFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_tag ADD CONSTRAINT FK_3974EFCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_tag ADD CONSTRAINT FK_3974EFC166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT FK_6E524572A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT FK_6E524572A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE dialogue_subject DROP FOREIGN KEY FK_7F052FB81BABB360');
        $this->addSql('ALTER TABLE dialogue_subject DROP FOREIGN KEY FK_7F052FB8A76ED395');
        $this->addSql('ALTER TABLE script DROP FOREIGN KEY FK_1C81873AA76ED395');
        $this->addSql('ALTER TABLE script DROP FOREIGN KEY FK_1C81873A166D1F9C');
        $this->addSql('ALTER TABLE script DROP FOREIGN KEY FK_1C81873A41B950E6');
        $this->addSql('ALTER TABLE script_script_tag DROP FOREIGN KEY FK_F4FA8F0CA1C01850');
        $this->addSql('ALTER TABLE script_script_tag DROP FOREIGN KEY FK_F4FA8F0CDA0E2BEB');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY FK_A4897264A1C01850');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY FK_A4897264A76ED395');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY FK_67DEBC70A1C01850');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY FK_67DEBC70A76ED395');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY FK_6BBDFAEFA1C01850');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY FK_6BBDFAEFA76ED395');
        $this->addSql('ALTER TABLE script_tag DROP FOREIGN KEY FK_3974EFCA76ED395');
        $this->addSql('ALTER TABLE script_tag DROP FOREIGN KEY FK_3974EFC166D1F9C');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY FK_6E524572A1C01850');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY FK_6E524572A76ED395');
        $this->addSql('DROP TABLE dialogue_subject');
        $this->addSql('DROP TABLE script');
        $this->addSql('DROP TABLE script_script_tag');
        $this->addSql('DROP TABLE script_chapter');
        $this->addSql('DROP TABLE script_dialogue');
        $this->addSql('DROP TABLE script_shot');
        $this->addSql('DROP TABLE script_tag');
        $this->addSql('DROP TABLE script_voice_over');
    }
}
