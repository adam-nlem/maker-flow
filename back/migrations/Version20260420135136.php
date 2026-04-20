<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260420135136 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE chat (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) DEFAULT NULL, ai_model VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, script_id INT NOT NULL, INDEX IDX_659DF2AAA76ED395 (user_id), INDEX IDX_659DF2AAA1C01850 (script_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE message (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, type VARCHAR(255) NOT NULL, suggested_answers JSON DEFAULT NULL, metadata JSON DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT DEFAULT NULL, chat_id INT NOT NULL, parent_message_id INT DEFAULT NULL, INDEX IDX_B6BD307FA76ED395 (user_id), INDEX IDX_B6BD307F1A9A7125 (chat_id), INDEX IDX_B6BD307F14399779 (parent_message_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_version (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, chat_id INT NOT NULL, message_id INT NOT NULL, INDEX IDX_E2141489A1C01850 (script_id), INDEX IDX_E21414891A9A7125 (chat_id), INDEX IDX_E2141489537A1329 (message_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE target_audience (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, creator_profile_id INT NOT NULL, INDEX IDX_27664471B4043523 (creator_profile_id), UNIQUE INDEX unique_name_creator_profile (name, creator_profile_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AAA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AAA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F1A9A7125 FOREIGN KEY (chat_id) REFERENCES chat (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F14399779 FOREIGN KEY (parent_message_id) REFERENCES message (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE script_version ADD CONSTRAINT FK_E2141489A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_version ADD CONSTRAINT FK_E21414891A9A7125 FOREIGN KEY (chat_id) REFERENCES chat (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_version ADD CONSTRAINT FK_E2141489537A1329 FOREIGN KEY (message_id) REFERENCES message (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE target_audience ADD CONSTRAINT FK_27664471B4043523 FOREIGN KEY (creator_profile_id) REFERENCES creator_profile (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE creator_profile DROP target_audience, DROP style_sample');
        $this->addSql('ALTER TABLE script_call_to_action ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT FK_AF7D2479BCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_AF7D2479BCD1E6F5 ON script_call_to_action (script_version_id)');
        $this->addSql('ALTER TABLE script_chapter ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT FK_A4897264BCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_A4897264BCD1E6F5 ON script_chapter (script_version_id)');
        $this->addSql('ALTER TABLE script_dialogue ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT FK_67DEBC70BCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_67DEBC70BCD1E6F5 ON script_dialogue (script_version_id)');
        $this->addSql('ALTER TABLE script_hook ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E23101BCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_64E23101BCD1E6F5 ON script_hook (script_version_id)');
        $this->addSql('ALTER TABLE script_retention_cue ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT FK_836438FDBCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_836438FDBCD1E6F5 ON script_retention_cue (script_version_id)');
        $this->addSql('ALTER TABLE script_shot ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT FK_6BBDFAEFBCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_6BBDFAEFBCD1E6F5 ON script_shot (script_version_id)');
        $this->addSql('ALTER TABLE script_text ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT FK_FB31D593BCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FB31D593BCD1E6F5 ON script_text (script_version_id)');
        $this->addSql('ALTER TABLE script_voice_over ADD script_version_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT FK_6E524572BCD1E6F5 FOREIGN KEY (script_version_id) REFERENCES script_version (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_6E524572BCD1E6F5 ON script_voice_over (script_version_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE chat DROP FOREIGN KEY FK_659DF2AAA76ED395');
        $this->addSql('ALTER TABLE chat DROP FOREIGN KEY FK_659DF2AAA1C01850');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FA76ED395');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F1A9A7125');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F14399779');
        $this->addSql('ALTER TABLE script_version DROP FOREIGN KEY FK_E2141489A1C01850');
        $this->addSql('ALTER TABLE script_version DROP FOREIGN KEY FK_E21414891A9A7125');
        $this->addSql('ALTER TABLE script_version DROP FOREIGN KEY FK_E2141489537A1329');
        $this->addSql('ALTER TABLE target_audience DROP FOREIGN KEY FK_27664471B4043523');
        $this->addSql('DROP TABLE chat');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE script_version');
        $this->addSql('DROP TABLE target_audience');
        $this->addSql('ALTER TABLE creator_profile ADD target_audience LONGTEXT DEFAULT NULL, ADD style_sample LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY FK_AF7D2479BCD1E6F5');
        $this->addSql('DROP INDEX IDX_AF7D2479BCD1E6F5 ON script_call_to_action');
        $this->addSql('ALTER TABLE script_call_to_action DROP script_version_id');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY FK_A4897264BCD1E6F5');
        $this->addSql('DROP INDEX IDX_A4897264BCD1E6F5 ON script_chapter');
        $this->addSql('ALTER TABLE script_chapter DROP script_version_id');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY FK_67DEBC70BCD1E6F5');
        $this->addSql('DROP INDEX IDX_67DEBC70BCD1E6F5 ON script_dialogue');
        $this->addSql('ALTER TABLE script_dialogue DROP script_version_id');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E23101BCD1E6F5');
        $this->addSql('DROP INDEX IDX_64E23101BCD1E6F5 ON script_hook');
        $this->addSql('ALTER TABLE script_hook DROP script_version_id');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY FK_836438FDBCD1E6F5');
        $this->addSql('DROP INDEX IDX_836438FDBCD1E6F5 ON script_retention_cue');
        $this->addSql('ALTER TABLE script_retention_cue DROP script_version_id');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY FK_6BBDFAEFBCD1E6F5');
        $this->addSql('DROP INDEX IDX_6BBDFAEFBCD1E6F5 ON script_shot');
        $this->addSql('ALTER TABLE script_shot DROP script_version_id');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY FK_FB31D593BCD1E6F5');
        $this->addSql('DROP INDEX IDX_FB31D593BCD1E6F5 ON script_text');
        $this->addSql('ALTER TABLE script_text DROP script_version_id');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY FK_6E524572BCD1E6F5');
        $this->addSql('DROP INDEX IDX_6E524572BCD1E6F5 ON script_voice_over');
        $this->addSql('ALTER TABLE script_voice_over DROP script_version_id');
    }
}
