<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260311000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create Insights tables (integration, post, post_group, post_insight, post_insight_breakdown, integration_insight, youtube_reporting_job)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE integration (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, platform VARCHAR(255) NOT NULL, access_token LONGTEXT DEFAULT NULL, refresh_token LONGTEXT DEFAULT NULL, scope JSON DEFAULT NULL, account_id VARCHAR(255) NOT NULL, user_name VARCHAR(255) NOT NULL, name VARCHAR(255) DEFAULT NULL, profile_picture_url LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, expires_at DATETIME DEFAULT NULL, refresh_token_expires_at DATETIME DEFAULT NULL, last_synced_at DATETIME NOT NULL, status VARCHAR(255) NOT NULL, user_id INT NOT NULL, project_id INT NOT NULL, UNIQUE INDEX UNIQ_FDE96D9BD17F50A6 (uuid), INDEX IDX_FDE96D9BA76ED395 (user_id), INDEX IDX_FDE96D9B166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_group (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, title VARCHAR(255) NOT NULL, user_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_FADBC82AA76ED395 (user_id), INDEX IDX_FADBC82A166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, external_id VARCHAR(255) NOT NULL, media_type VARCHAR(255) NOT NULL, duration INT NOT NULL, published_at DATETIME NOT NULL, caption LONGTEXT DEFAULT NULL, external_url VARCHAR(255) NOT NULL, integration_id INT NOT NULL, post_group_id INT DEFAULT NULL, user_id INT NOT NULL, INDEX IDX_5A8A6C8D9E82DDEA (integration_id), INDEX IDX_5A8A6C8D41B950E6 (post_group_id), INDEX IDX_5A8A6C8DA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_insight (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, type VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, value_format VARCHAR(255) NOT NULL, post_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_C3DCA4E84B89032C (post_id), INDEX IDX_C3DCA4E8A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_insight_breakdown (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, type VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, value_format VARCHAR(255) NOT NULL, date DATETIME NOT NULL, country_code VARCHAR(2) DEFAULT NULL, subscribed_status VARCHAR(255) DEFAULT NULL, live_or_on_demand VARCHAR(255) DEFAULT NULL, post_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_CF30449A4B89032C (post_id), INDEX IDX_CF30449AA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE integration_insight (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, type VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, value_format VARCHAR(255) NOT NULL, integration_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_9318A9829E82DDEA (integration_id), INDEX IDX_9318A982A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE youtube_reporting_job (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, external_job_id VARCHAR(255) NOT NULL, report_type VARCHAR(255) NOT NULL, last_processed_report_id VARCHAR(255) DEFAULT NULL, last_processed_report_date DATETIME DEFAULT NULL, integration_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_F8CE95FF9E82DDEA (integration_id), INDEX IDX_F8CE95FFA76ED395 (user_id), UNIQUE INDEX unique_integration_report_type (integration_id, report_type), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT FK_FADBC82AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT FK_FADBC82A166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D9E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D41B950E6 FOREIGN KEY (post_group_id) REFERENCES post_group (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight ADD CONSTRAINT FK_C3DCA4E84B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight ADD CONSTRAINT FK_C3DCA4E8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight_breakdown ADD CONSTRAINT FK_CF30449A4B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight_breakdown ADD CONSTRAINT FK_CF30449AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE integration_insight ADD CONSTRAINT FK_9318A9829E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE integration_insight ADD CONSTRAINT FK_9318A982A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE youtube_reporting_job ADD CONSTRAINT FK_F8CE95FF9E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE youtube_reporting_job ADD CONSTRAINT FK_F8CE95FFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE integration_insight DROP FOREIGN KEY FK_9318A9829E82DDEA');
        $this->addSql('ALTER TABLE integration_insight DROP FOREIGN KEY FK_9318A982A76ED395');
        $this->addSql('ALTER TABLE youtube_reporting_job DROP FOREIGN KEY FK_F8CE95FF9E82DDEA');
        $this->addSql('ALTER TABLE youtube_reporting_job DROP FOREIGN KEY FK_F8CE95FFA76ED395');
        $this->addSql('ALTER TABLE post_insight_breakdown DROP FOREIGN KEY FK_CF30449A4B89032C');
        $this->addSql('ALTER TABLE post_insight_breakdown DROP FOREIGN KEY FK_CF30449AA76ED395');
        $this->addSql('ALTER TABLE post_insight DROP FOREIGN KEY FK_C3DCA4E84B89032C');
        $this->addSql('ALTER TABLE post_insight DROP FOREIGN KEY FK_C3DCA4E8A76ED395');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D9E82DDEA');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D41B950E6');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DA76ED395');
        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY FK_FADBC82AA76ED395');
        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY FK_FADBC82A166D1F9C');
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9BA76ED395');
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9B166D1F9C');
        $this->addSql('DROP TABLE youtube_reporting_job');
        $this->addSql('DROP TABLE integration_insight');
        $this->addSql('DROP TABLE post_insight_breakdown');
        $this->addSql('DROP TABLE post_insight');
        $this->addSql('DROP TABLE post');
        $this->addSql('DROP TABLE post_group');
        $this->addSql('DROP TABLE integration');
    }
}
