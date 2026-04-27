<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260427163410 extends AbstractMigration
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
        $this->addSql('CREATE TABLE script_part (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, position INT NOT NULL, type VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_89B50292A1C01850 (script_id), INDEX IDX_89B50292A76ED395 (user_id), INDEX IDX_89B50292A1C01850462CE4F5 (script_id, position), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_part_suggestion (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, action VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, original_content LONGTEXT DEFAULT NULL, proposed_content LONGTEXT DEFAULT NULL, proposed_type VARCHAR(255) DEFAULT NULL, proposed_position INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, message_id INT NOT NULL, script_part_id INT DEFAULT NULL, user_id INT NOT NULL, INDEX IDX_75C280E8A1C01850 (script_id), INDEX IDX_75C280E811EB8CA6 (script_part_id), INDEX IDX_75C280E8A76ED395 (user_id), INDEX IDX_75C280E8A1C018507B00651C (script_id, status), INDEX IDX_75C280E8537A1329 (message_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AAA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AAA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F1A9A7125 FOREIGN KEY (chat_id) REFERENCES chat (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F14399779 FOREIGN KEY (parent_message_id) REFERENCES message (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE script_part ADD CONSTRAINT FK_89B50292A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_part ADD CONSTRAINT FK_89B50292A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_part_suggestion ADD CONSTRAINT FK_75C280E8A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_part_suggestion ADD CONSTRAINT FK_75C280E8537A1329 FOREIGN KEY (message_id) REFERENCES message (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_part_suggestion ADD CONSTRAINT FK_75C280E811EB8CA6 FOREIGN KEY (script_part_id) REFERENCES script_part (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_part_suggestion ADD CONSTRAINT FK_75C280E8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE creator_profile DROP FOREIGN KEY `FK_FC5137B166D1F9C`');
        $this->addSql('ALTER TABLE creator_profile DROP FOREIGN KEY `FK_FC5137BA76ED395`');
        $this->addSql('ALTER TABLE dialogue_subject DROP FOREIGN KEY `FK_7F052FB81BABB360`');
        $this->addSql('ALTER TABLE dialogue_subject DROP FOREIGN KEY `FK_7F052FB8A76ED395`');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY `FK_AF7D247911CE609`');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY `FK_AF7D2479A1C01850`');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY `FK_AF7D2479A76ED395`');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY `FK_A489726411CE609`');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY `FK_A4897264A1C01850`');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY `FK_A4897264A76ED395`');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY `FK_67DEBC7011CE609`');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY `FK_67DEBC70A1C01850`');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY `FK_67DEBC70A76ED395`');
        $this->addSql('ALTER TABLE script_generation DROP FOREIGN KEY `FK_244BADCBA1C01850`');
        $this->addSql('ALTER TABLE script_generation DROP FOREIGN KEY `FK_244BADCBA76ED395`');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY `FK_64E2310111CE609`');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY `FK_64E23101A1C01850`');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY `FK_64E23101A39EFAE8`');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY `FK_64E23101A76ED395`');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY `FK_836438FD11CE609`');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY `FK_836438FDA1C01850`');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY `FK_836438FDA76ED395`');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY `FK_6BBDFAEF11CE609`');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY `FK_6BBDFAEFA1C01850`');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY `FK_6BBDFAEFA76ED395`');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY `FK_FB31D59311CE609`');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY `FK_FB31D593A1C01850`');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY `FK_FB31D593A76ED395`');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY `FK_6E52457211CE609`');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY `FK_6E524572A1C01850`');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY `FK_6E524572A76ED395`');
        $this->addSql('DROP TABLE creator_profile');
        $this->addSql('DROP TABLE dialogue_subject');
        $this->addSql('DROP TABLE script_call_to_action');
        $this->addSql('DROP TABLE script_chapter');
        $this->addSql('DROP TABLE script_dialogue');
        $this->addSql('DROP TABLE script_generation');
        $this->addSql('DROP TABLE script_hook');
        $this->addSql('DROP TABLE script_retention_cue');
        $this->addSql('DROP TABLE script_shot');
        $this->addSql('DROP TABLE script_text');
        $this->addSql('DROP TABLE script_voice_over');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE creator_profile (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, niche LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, target_audience LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, tones JSON DEFAULT NULL, signature_phrases JSON DEFAULT NULL, never_list JSON DEFAULT NULL, style_sample LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, project_id INT NOT NULL, UNIQUE INDEX unique_project_user (project_id, user_id), INDEX IDX_FC5137BA76ED395 (user_id), INDEX IDX_FC5137B166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE dialogue_subject (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, speaker VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_dialogue_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_7F052FB81BABB360 (script_dialogue_id), INDEX IDX_7F052FB8A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_call_to_action (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, call_to_action_type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_AF7D2479A1C01850 (script_id), INDEX IDX_AF7D2479A76ED395 (user_id), INDEX IDX_AF7D247911CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_chapter (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, title VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, description LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, chapter_type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_A4897264A1C01850 (script_id), INDEX IDX_A4897264A76ED395 (user_id), INDEX IDX_A489726411CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_dialogue (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, title VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, description LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_67DEBC70A1C01850 (script_id), INDEX IDX_67DEBC70A76ED395 (user_id), INDEX IDX_67DEBC7011CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_generation (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, status VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, topic LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, goal VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, key_points LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, opening_style VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, duration VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, call_to_action LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, extra_context LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, active_skills JSON NOT NULL, skill_inputs JSON NOT NULL, ai_model VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'gemini\' NOT NULL COLLATE `utf8mb4_unicode_ci`, assembled_prompt LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, error_message LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL, completed_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_244BADCBA1C01850 (script_id), INDEX IDX_244BADCBA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_hook (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, hook_template_id INT DEFAULT NULL, INDEX IDX_64E23101A1C01850 (script_id), INDEX IDX_64E23101A76ED395 (user_id), INDEX IDX_64E2310111CE609 (script_generation_id), INDEX IDX_64E23101A39EFAE8 (hook_template_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_retention_cue (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, retention_cue_type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_836438FDA1C01850 (script_id), INDEX IDX_836438FDA76ED395 (user_id), INDEX IDX_836438FD11CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_shot (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, shot_type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_6BBDFAEFA1C01850 (script_id), INDEX IDX_6BBDFAEFA76ED395 (user_id), INDEX IDX_6BBDFAEF11CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_text (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_FB31D593A1C01850 (script_id), INDEX IDX_FB31D593A76ED395 (user_id), INDEX IDX_FB31D59311CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE script_voice_over (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, tone VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_6E524572A1C01850 (script_id), INDEX IDX_6E524572A76ED395 (user_id), INDEX IDX_6E52457211CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE creator_profile ADD CONSTRAINT `FK_FC5137B166D1F9C` FOREIGN KEY (project_id) REFERENCES project (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE creator_profile ADD CONSTRAINT `FK_FC5137BA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE dialogue_subject ADD CONSTRAINT `FK_7F052FB81BABB360` FOREIGN KEY (script_dialogue_id) REFERENCES script_dialogue (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE dialogue_subject ADD CONSTRAINT `FK_7F052FB8A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT `FK_AF7D247911CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT `FK_AF7D2479A1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT `FK_AF7D2479A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT `FK_A489726411CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT `FK_A4897264A1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT `FK_A4897264A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT `FK_67DEBC7011CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT `FK_67DEBC70A1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT `FK_67DEBC70A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_generation ADD CONSTRAINT `FK_244BADCBA1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_generation ADD CONSTRAINT `FK_244BADCBA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT `FK_64E2310111CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT `FK_64E23101A1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT `FK_64E23101A39EFAE8` FOREIGN KEY (hook_template_id) REFERENCES hook_template (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT `FK_64E23101A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT `FK_836438FD11CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT `FK_836438FDA1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT `FK_836438FDA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT `FK_6BBDFAEF11CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT `FK_6BBDFAEFA1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT `FK_6BBDFAEFA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT `FK_FB31D59311CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT `FK_FB31D593A1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT `FK_FB31D593A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT `FK_6E52457211CE609` FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT `FK_6E524572A1C01850` FOREIGN KEY (script_id) REFERENCES script (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT `FK_6E524572A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE chat DROP FOREIGN KEY FK_659DF2AAA76ED395');
        $this->addSql('ALTER TABLE chat DROP FOREIGN KEY FK_659DF2AAA1C01850');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FA76ED395');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F1A9A7125');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F14399779');
        $this->addSql('ALTER TABLE script_part DROP FOREIGN KEY FK_89B50292A1C01850');
        $this->addSql('ALTER TABLE script_part DROP FOREIGN KEY FK_89B50292A76ED395');
        $this->addSql('ALTER TABLE script_part_suggestion DROP FOREIGN KEY FK_75C280E8A1C01850');
        $this->addSql('ALTER TABLE script_part_suggestion DROP FOREIGN KEY FK_75C280E8537A1329');
        $this->addSql('ALTER TABLE script_part_suggestion DROP FOREIGN KEY FK_75C280E811EB8CA6');
        $this->addSql('ALTER TABLE script_part_suggestion DROP FOREIGN KEY FK_75C280E8A76ED395');
        $this->addSql('DROP TABLE chat');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE script_part');
        $this->addSql('DROP TABLE script_part_suggestion');
    }
}
