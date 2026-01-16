<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration for Project, Module, UserModule and Integration tables
 */
final class Version20260113105110 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create project, module, user_module and integration tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE project (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, finished_at DATETIME DEFAULT NULL, types LONGTEXT NOT NULL, user_id INT NOT NULL, INDEX IDX_2FB3D0EEA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE module (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, is_active TINYINT(1) NOT NULL, is_premium TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, module_identifier VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_C242628D17F50A6 (uuid), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE integration (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, provider VARCHAR(255) NOT NULL, access_token VARCHAR(255) NOT NULL, refresh_token VARCHAR(255) DEFAULT NULL, scope JSON DEFAULT NULL, account_id VARCHAR(255) NOT NULL, user_name VARCHAR(255) NOT NULL, name VARCHAR(255) DEFAULT NULL, avatar_url VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, expires_at DATETIME DEFAULT NULL, last_synced_at DATETIME NOT NULL, status VARCHAR(255) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_FDE96D9BD17F50A6 (uuid), INDEX IDX_FDE96D9BA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE user_module (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, x_index INT NOT NULL, y_index INT NOT NULL, size VARCHAR(255) NOT NULL, is_active TINYINT(1) NOT NULL, is_hidden TINYINT(1) NOT NULL, user_id INT NOT NULL, module_id INT NOT NULL, project_id INT NOT NULL, UNIQUE INDEX UNIQ_69763D15D17F50A6 (uuid), INDEX IDX_69763D15A76ED395 (user_id), INDEX IDX_69763D15AFC2B591 (module_id), INDEX IDX_69763D15166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE user_module_integration (user_module_id INT NOT NULL, integration_id INT NOT NULL, INDEX IDX_DF8681B2AF223875 (user_module_id), INDEX IDX_DF8681B29E82DDEA (integration_id), PRIMARY KEY(user_module_id, integration_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15AFC2B591 FOREIGN KEY (module_id) REFERENCES module (id)');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_module_integration ADD CONSTRAINT FK_DF8681B2AF223875 FOREIGN KEY (user_module_id) REFERENCES user_module (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_module_integration ADD CONSTRAINT FK_DF8681B29E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_module_integration DROP FOREIGN KEY FK_DF8681B2AF223875');
        $this->addSql('ALTER TABLE user_module_integration DROP FOREIGN KEY FK_DF8681B29E82DDEA');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15A76ED395');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15AFC2B591');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15166D1F9C');
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9BA76ED395');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');
        $this->addSql('DROP TABLE user_module_integration');
        $this->addSql('DROP TABLE user_module');
        $this->addSql('DROP TABLE integration');
        $this->addSql('DROP TABLE module');
        $this->addSql('DROP TABLE project');
    }
}
