<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260220070014 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE integration (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, provider VARCHAR(255) NOT NULL, access_token LONGTEXT NOT NULL, refresh_token LONGTEXT DEFAULT NULL, scope JSON DEFAULT NULL, account_id VARCHAR(255) NOT NULL, user_name VARCHAR(255) NOT NULL, name VARCHAR(255) DEFAULT NULL, profile_picture_url LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, expires_at DATETIME DEFAULT NULL, refresh_token_expires_at DATETIME DEFAULT NULL, last_synced_at DATETIME NOT NULL, status VARCHAR(255) NOT NULL, user_id INT NOT NULL, project_id INT NOT NULL, UNIQUE INDEX UNIQ_FDE96D9BD17F50A6 (uuid), INDEX IDX_FDE96D9BA76ED395 (user_id), INDEX IDX_FDE96D9B166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE integration_insight (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, type VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, value_format VARCHAR(255) NOT NULL, integration_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_9318A9829E82DDEA (integration_id), INDEX IDX_9318A982A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, external_id VARCHAR(255) NOT NULL, media_type VARCHAR(255) NOT NULL, duration INT NOT NULL, published_at DATETIME NOT NULL, caption LONGTEXT DEFAULT NULL, external_url VARCHAR(255) NOT NULL, integration_id INT NOT NULL, post_group_id INT DEFAULT NULL, user_id INT NOT NULL, INDEX IDX_5A8A6C8D9E82DDEA (integration_id), INDEX IDX_5A8A6C8D41B950E6 (post_group_id), INDEX IDX_5A8A6C8DA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_group (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, title VARCHAR(255) NOT NULL, user_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_FADBC82AA76ED395 (user_id), INDEX IDX_FADBC82A166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_insight (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, type VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, value_format VARCHAR(255) NOT NULL, post_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_C3DCA4E84B89032C (post_id), INDEX IDX_C3DCA4E8A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_insight_breakdown (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, type VARCHAR(255) NOT NULL, value DOUBLE PRECISION NOT NULL, value_format VARCHAR(255) NOT NULL, date DATETIME NOT NULL, country_code VARCHAR(2) DEFAULT NULL, subscribed_status VARCHAR(255) DEFAULT NULL, live_or_on_demand VARCHAR(255) DEFAULT NULL, post_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_CF30449A4B89032C (post_id), INDEX IDX_CF30449AA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE project (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, finished_at DATETIME DEFAULT NULL, types LONGTEXT NOT NULL, user_id INT NOT NULL, INDEX IDX_2FB3D0EEA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, project_id INT NOT NULL, INDEX IDX_1B199E07A76ED395 (user_id), INDEX IDX_1B199E07166D1F9C (project_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list_tag (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, color VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, todo_list_id INT NOT NULL, INDEX IDX_35DD63CEA76ED395 (user_id), INDEX IDX_35DD63CEE8A7DCFA (todo_list_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list_task (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT DEFAULT NULL, status VARCHAR(255) NOT NULL, priority VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, finished_at DATETIME DEFAULT NULL, due_date DATETIME DEFAULT NULL, user_id INT NOT NULL, todo_list_id INT NOT NULL, INDEX IDX_5A25B2DCA76ED395 (user_id), INDEX IDX_5A25B2DCE8A7DCFA (todo_list_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list_task_todo_list_tag (todo_list_task_id INT NOT NULL, todo_list_tag_id INT NOT NULL, INDEX IDX_C9CCC2897F251143 (todo_list_task_id), INDEX IDX_C9CCC2894BC2E842 (todo_list_tag_id), PRIMARY KEY (todo_list_task_id, todo_list_tag_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE token (id INT AUTO_INCREMENT NOT NULL, value VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, expires_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_5F37A13BA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, roles JSON NOT NULL, UNIQUE INDEX UNIQ_8D93D649D17F50A6 (uuid), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE youtube_reporting_job (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, external_job_id VARCHAR(255) NOT NULL, report_type VARCHAR(255) NOT NULL, last_processed_report_id VARCHAR(255) DEFAULT NULL, last_processed_report_date DATETIME DEFAULT NULL, integration_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_F8CE95FF9E82DDEA (integration_id), INDEX IDX_F8CE95FFA76ED395 (user_id), UNIQUE INDEX unique_integration_report_type (integration_id, report_type), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE integration_insight ADD CONSTRAINT FK_9318A9829E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE integration_insight ADD CONSTRAINT FK_9318A982A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D9E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D41B950E6 FOREIGN KEY (post_group_id) REFERENCES post_group (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT FK_FADBC82AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT FK_FADBC82A166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight ADD CONSTRAINT FK_C3DCA4E84B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight ADD CONSTRAINT FK_C3DCA4E8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight_breakdown ADD CONSTRAINT FK_CF30449A4B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_insight_breakdown ADD CONSTRAINT FK_CF30449AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT FK_1B199E07A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT FK_1B199E07166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT FK_35DD63CEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT FK_35DD63CEE8A7DCFA FOREIGN KEY (todo_list_id) REFERENCES todo_list (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT FK_5A25B2DCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT FK_5A25B2DCE8A7DCFA FOREIGN KEY (todo_list_id) REFERENCES todo_list (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag ADD CONSTRAINT FK_C9CCC2897F251143 FOREIGN KEY (todo_list_task_id) REFERENCES todo_list_task (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag ADD CONSTRAINT FK_C9CCC2894BC2E842 FOREIGN KEY (todo_list_tag_id) REFERENCES todo_list_tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE token ADD CONSTRAINT FK_5F37A13BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE youtube_reporting_job ADD CONSTRAINT FK_F8CE95FF9E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE youtube_reporting_job ADD CONSTRAINT FK_F8CE95FFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9BA76ED395');
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9B166D1F9C');
        $this->addSql('ALTER TABLE integration_insight DROP FOREIGN KEY FK_9318A9829E82DDEA');
        $this->addSql('ALTER TABLE integration_insight DROP FOREIGN KEY FK_9318A982A76ED395');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D9E82DDEA');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D41B950E6');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DA76ED395');
        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY FK_FADBC82AA76ED395');
        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY FK_FADBC82A166D1F9C');
        $this->addSql('ALTER TABLE post_insight DROP FOREIGN KEY FK_C3DCA4E84B89032C');
        $this->addSql('ALTER TABLE post_insight DROP FOREIGN KEY FK_C3DCA4E8A76ED395');
        $this->addSql('ALTER TABLE post_insight_breakdown DROP FOREIGN KEY FK_CF30449A4B89032C');
        $this->addSql('ALTER TABLE post_insight_breakdown DROP FOREIGN KEY FK_CF30449AA76ED395');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY FK_1B199E07A76ED395');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY FK_1B199E07166D1F9C');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY FK_35DD63CEA76ED395');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY FK_35DD63CEE8A7DCFA');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY FK_5A25B2DCA76ED395');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY FK_5A25B2DCE8A7DCFA');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag DROP FOREIGN KEY FK_C9CCC2897F251143');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag DROP FOREIGN KEY FK_C9CCC2894BC2E842');
        $this->addSql('ALTER TABLE token DROP FOREIGN KEY FK_5F37A13BA76ED395');
        $this->addSql('ALTER TABLE youtube_reporting_job DROP FOREIGN KEY FK_F8CE95FF9E82DDEA');
        $this->addSql('ALTER TABLE youtube_reporting_job DROP FOREIGN KEY FK_F8CE95FFA76ED395');
        $this->addSql('DROP TABLE integration');
        $this->addSql('DROP TABLE integration_insight');
        $this->addSql('DROP TABLE post');
        $this->addSql('DROP TABLE post_group');
        $this->addSql('DROP TABLE post_insight');
        $this->addSql('DROP TABLE post_insight_breakdown');
        $this->addSql('DROP TABLE project');
        $this->addSql('DROP TABLE todo_list');
        $this->addSql('DROP TABLE todo_list_tag');
        $this->addSql('DROP TABLE todo_list_task');
        $this->addSql('DROP TABLE todo_list_task_todo_list_tag');
        $this->addSql('DROP TABLE token');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE youtube_reporting_job');
    }
}
