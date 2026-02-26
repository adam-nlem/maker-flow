<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260226081025 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE creator_profile (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, platform VARCHAR(255) DEFAULT NULL, content_type VARCHAR(255) DEFAULT NULL, niche LONGTEXT DEFAULT NULL, target_audience LONGTEXT DEFAULT NULL, tones JSON DEFAULT NULL, signature_phrases JSON DEFAULT NULL, never_list JSON DEFAULT NULL, style_sample LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_FC5137BA76ED395 (user_id), INDEX IDX_FC5137B166D1F9C (project_id), UNIQUE INDEX unique_project_user (project_id, user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE script_generation (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, status VARCHAR(255) NOT NULL, topic VARCHAR(255) NOT NULL, goal VARCHAR(255) NOT NULL, key_points LONGTEXT DEFAULT NULL, opening_style VARCHAR(255) NOT NULL, call_to_action LONGTEXT DEFAULT NULL, extra_context LONGTEXT DEFAULT NULL, active_skills JSON NOT NULL, skill_inputs JSON NOT NULL, replace_existing TINYINT(1) NOT NULL, assembled_prompt LONGTEXT DEFAULT NULL, error_message LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, completed_at DATETIME DEFAULT NULL, script_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_244BADCBA1C01850 (script_id), INDEX IDX_244BADCBA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE creator_profile ADD CONSTRAINT FK_FC5137BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE creator_profile ADD CONSTRAINT FK_FC5137B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_generation ADD CONSTRAINT FK_244BADCBA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script_generation ADD CONSTRAINT FK_244BADCBA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE script ADD content_type VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE script_voice_over CHANGE voice_over_type tone VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE creator_profile DROP FOREIGN KEY FK_FC5137BA76ED395');
        $this->addSql('ALTER TABLE creator_profile DROP FOREIGN KEY FK_FC5137B166D1F9C');
        $this->addSql('ALTER TABLE script_generation DROP FOREIGN KEY FK_244BADCBA1C01850');
        $this->addSql('ALTER TABLE script_generation DROP FOREIGN KEY FK_244BADCBA76ED395');
        $this->addSql('DROP TABLE creator_profile');
        $this->addSql('DROP TABLE script_generation');
        $this->addSql('ALTER TABLE script DROP content_type');
        $this->addSql('ALTER TABLE script_voice_over CHANGE tone voice_over_type VARCHAR(255) NOT NULL');
    }
}
