<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260311000005 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create Scripts tables (script, script_tag, script_generation, hook_template, creator_profile, script parts)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE script (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, published_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, platforms JSON DEFAULT NULL, content_type VARCHAR(255) DEFAULT NULL, status VARCHAR(255) DEFAULT NULL, user_id INT NOT NULL, project_id INT NOT NULL, post_group_id INT DEFAULT NULL, INDEX IDX_1C81873AA76ED395 (user_id), INDEX IDX_1C81873A166D1F9C (project_id), UNIQUE INDEX UNIQ_1C81873A41B950E6 (post_group_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_tag (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, color VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_3974EFCA76ED395 (user_id), INDEX IDX_3974EFC166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_script_tag (script_id INT NOT NULL, script_tag_id INT NOT NULL, INDEX IDX_F4FA8F0CA1C01850 (script_id), INDEX IDX_F4FA8F0CDA0E2BEB (script_tag_id), PRIMARY KEY (script_id, script_tag_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_generation (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, status VARCHAR(255) NOT NULL, topic LONGTEXT NOT NULL, goal VARCHAR(255) NOT NULL, key_points LONGTEXT DEFAULT NULL, opening_style VARCHAR(255) NOT NULL, duration VARCHAR(255) NOT NULL, call_to_action LONGTEXT DEFAULT NULL, extra_context LONGTEXT DEFAULT NULL, active_skills JSON NOT NULL, skill_inputs JSON NOT NULL, ai_model VARCHAR(255) DEFAULT \'gemini\' NOT NULL, assembled_prompt LONGTEXT DEFAULT NULL, error_message LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, completed_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_244BADCBA1C01850 (script_id), INDEX IDX_244BADCBA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE hook_template (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, is_public TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_B4C06FFCA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE creator_profile (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, platforms JSON DEFAULT NULL, content_type VARCHAR(255) DEFAULT NULL, niche LONGTEXT DEFAULT NULL, target_audience LONGTEXT DEFAULT NULL, tones JSON DEFAULT NULL, signature_phrases JSON DEFAULT NULL, never_list JSON DEFAULT NULL, style_sample LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_FC5137BA76ED395 (user_id), INDEX IDX_FC5137B166D1F9C (project_id), UNIQUE INDEX unique_project_user (project_id, user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_chapter (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, chapter_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_A4897264A1C01850 (script_id), INDEX IDX_A4897264A76ED395 (user_id), INDEX IDX_A489726411CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_dialogue (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_67DEBC70A1C01850 (script_id), INDEX IDX_67DEBC70A76ED395 (user_id), INDEX IDX_67DEBC7011CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE dialogue_subject (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, speaker VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_dialogue_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_7F052FB81BABB360 (script_dialogue_id), INDEX IDX_7F052FB8A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_shot (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, shot_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_6BBDFAEFA1C01850 (script_id), INDEX IDX_6BBDFAEFA76ED395 (user_id), INDEX IDX_6BBDFAEF11CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_voice_over (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, tone VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_6E524572A1C01850 (script_id), INDEX IDX_6E524572A76ED395 (user_id), INDEX IDX_6E52457211CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_text (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_FB31D593A1C01850 (script_id), INDEX IDX_FB31D593A76ED395 (user_id), INDEX IDX_FB31D59311CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_call_to_action (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, call_to_action_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_AF7D2479A1C01850 (script_id), INDEX IDX_AF7D2479A76ED395 (user_id), INDEX IDX_AF7D247911CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_retention_cue (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, retention_cue_type VARCHAR(255) NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, INDEX IDX_836438FDA1C01850 (script_id), INDEX IDX_836438FDA76ED395 (user_id), INDEX IDX_836438FD11CE609 (script_generation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_hook (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, content LONGTEXT NOT NULL, position INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, script_id INT NOT NULL, user_id INT NOT NULL, script_generation_id INT DEFAULT NULL, hook_template_id INT DEFAULT NULL, INDEX IDX_64E23101A1C01850 (script_id), INDEX IDX_64E23101A76ED395 (user_id), INDEX IDX_64E2310111CE609 (script_generation_id), INDEX IDX_64E23101A39EFAE8 (hook_template_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE script ADD CONSTRAINT FK_1C81873AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script ADD CONSTRAINT FK_1C81873A166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script ADD CONSTRAINT FK_1C81873A41B950E6 FOREIGN KEY (post_group_id) REFERENCES post_group (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE script_tag ADD CONSTRAINT FK_3974EFCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_tag ADD CONSTRAINT FK_3974EFC166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_script_tag ADD CONSTRAINT FK_F4FA8F0CA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_script_tag ADD CONSTRAINT FK_F4FA8F0CDA0E2BEB FOREIGN KEY (script_tag_id) REFERENCES script_tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_generation ADD CONSTRAINT FK_244BADCBA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_generation ADD CONSTRAINT FK_244BADCBA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT FK_B4C06FFCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE creator_profile ADD CONSTRAINT FK_FC5137BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE creator_profile ADD CONSTRAINT FK_FC5137B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT FK_A4897264A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT FK_A4897264A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT FK_A489726411CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT FK_67DEBC70A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT FK_67DEBC70A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT FK_67DEBC7011CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE dialogue_subject ADD CONSTRAINT FK_7F052FB81BABB360 FOREIGN KEY (script_dialogue_id) REFERENCES script_dialogue (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE dialogue_subject ADD CONSTRAINT FK_7F052FB8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT FK_6BBDFAEFA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT FK_6BBDFAEFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT FK_6BBDFAEF11CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT FK_6E524572A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT FK_6E524572A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT FK_6E52457211CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT FK_FB31D593A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT FK_FB31D593A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT FK_FB31D59311CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT FK_AF7D2479A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT FK_AF7D2479A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT FK_AF7D247911CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT FK_836438FDA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT FK_836438FDA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT FK_836438FD11CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E23101A1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E23101A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E2310111CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_hook ADD CONSTRAINT FK_64E23101A39EFAE8 FOREIGN KEY (hook_template_id) REFERENCES hook_template (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E23101A1C01850');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E23101A76ED395');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E2310111CE609');
        $this->addSql('ALTER TABLE script_hook DROP FOREIGN KEY FK_64E23101A39EFAE8');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY FK_836438FDA1C01850');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY FK_836438FDA76ED395');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY FK_836438FD11CE609');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY FK_AF7D2479A1C01850');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY FK_AF7D2479A76ED395');
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY FK_AF7D247911CE609');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY FK_FB31D593A1C01850');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY FK_FB31D593A76ED395');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY FK_FB31D59311CE609');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY FK_6E524572A1C01850');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY FK_6E524572A76ED395');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY FK_6E52457211CE609');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY FK_6BBDFAEFA1C01850');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY FK_6BBDFAEFA76ED395');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY FK_6BBDFAEF11CE609');
        $this->addSql('ALTER TABLE dialogue_subject DROP FOREIGN KEY FK_7F052FB81BABB360');
        $this->addSql('ALTER TABLE dialogue_subject DROP FOREIGN KEY FK_7F052FB8A76ED395');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY FK_67DEBC70A1C01850');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY FK_67DEBC70A76ED395');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY FK_67DEBC7011CE609');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY FK_A4897264A1C01850');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY FK_A4897264A76ED395');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY FK_A489726411CE609');
        $this->addSql('ALTER TABLE creator_profile DROP FOREIGN KEY FK_FC5137BA76ED395');
        $this->addSql('ALTER TABLE creator_profile DROP FOREIGN KEY FK_FC5137B166D1F9C');
        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY FK_B4C06FFCA76ED395');
        $this->addSql('ALTER TABLE script_generation DROP FOREIGN KEY FK_244BADCBA1C01850');
        $this->addSql('ALTER TABLE script_generation DROP FOREIGN KEY FK_244BADCBA76ED395');
        $this->addSql('ALTER TABLE script_script_tag DROP FOREIGN KEY FK_F4FA8F0CA1C01850');
        $this->addSql('ALTER TABLE script_script_tag DROP FOREIGN KEY FK_F4FA8F0CDA0E2BEB');
        $this->addSql('ALTER TABLE script_tag DROP FOREIGN KEY FK_3974EFCA76ED395');
        $this->addSql('ALTER TABLE script_tag DROP FOREIGN KEY FK_3974EFC166D1F9C');
        $this->addSql('ALTER TABLE script DROP FOREIGN KEY FK_1C81873AA76ED395');
        $this->addSql('ALTER TABLE script DROP FOREIGN KEY FK_1C81873A166D1F9C');
        $this->addSql('ALTER TABLE script DROP FOREIGN KEY FK_1C81873A41B950E6');
        $this->addSql('DROP TABLE script_hook');
        $this->addSql('DROP TABLE script_retention_cue');
        $this->addSql('DROP TABLE script_call_to_action');
        $this->addSql('DROP TABLE script_text');
        $this->addSql('DROP TABLE script_voice_over');
        $this->addSql('DROP TABLE script_shot');
        $this->addSql('DROP TABLE dialogue_subject');
        $this->addSql('DROP TABLE script_dialogue');
        $this->addSql('DROP TABLE script_chapter');
        $this->addSql('DROP TABLE creator_profile');
        $this->addSql('DROP TABLE hook_template');
        $this->addSql('DROP TABLE script_generation');
        $this->addSql('DROP TABLE script_script_tag');
        $this->addSql('DROP TABLE script_tag');
        $this->addSql('DROP TABLE script');
    }
}
