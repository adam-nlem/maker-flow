<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251125211049 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE integration (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, provider VARCHAR(255) NOT NULL, access_token VARCHAR(255) NOT NULL, refresh_token VARCHAR(255) DEFAULT NULL, scope JSON DEFAULT NULL, external_account_id VARCHAR(255) NOT NULL, external_account_name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, expires_at DATETIME DEFAULT NULL, last_synced_at DATETIME NOT NULL, status VARCHAR(255) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_FDE96D9BD17F50A6 (uuid), INDEX IDX_FDE96D9BA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE module (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, is_active TINYINT(1) NOT NULL, is_premium TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, module_identifier VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_C242628D17F50A6 (uuid), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE user_module (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, x_index INT NOT NULL, y_index INT NOT NULL, size VARCHAR(255) NOT NULL, is_active TINYINT(1) NOT NULL, is_hidden TINYINT(1) NOT NULL, user_id INT NOT NULL, module_id INT NOT NULL, integration_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_69763D15D17F50A6 (uuid), INDEX IDX_69763D15A76ED395 (user_id), INDEX IDX_69763D15AFC2B591 (module_id), INDEX IDX_69763D159E82DDEA (integration_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15AFC2B591 FOREIGN KEY (module_id) REFERENCES module (id)');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D159E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9BA76ED395');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15A76ED395');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15AFC2B591');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D159E82DDEA');
        $this->addSql('DROP TABLE integration');
        $this->addSql('DROP TABLE module');
        $this->addSql('DROP TABLE user_module');
    }
}
