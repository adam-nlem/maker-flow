<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260311000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create Core tables (user, token, otp)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, roles JSON NOT NULL, verified_at DATETIME DEFAULT NULL, stripe_customer_id VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649D17F50A6 (uuid), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE token (id INT AUTO_INCREMENT NOT NULL, value VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, expires_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_5F37A13BA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE otp (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, code VARCHAR(6) NOT NULL, type VARCHAR(255) NOT NULL, pending_otp_token VARCHAR(255) NOT NULL, attempts INT NOT NULL, used_at DATETIME DEFAULT NULL, expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_A79C98C1D17F50A6 (uuid), UNIQUE INDEX UNIQ_A79C98C18EEFEE15 (pending_otp_token), INDEX IDX_A79C98C1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE token ADD CONSTRAINT FK_5F37A13BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE otp ADD CONSTRAINT FK_A79C98C1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE token DROP FOREIGN KEY FK_5F37A13BA76ED395');
        $this->addSql('ALTER TABLE otp DROP FOREIGN KEY FK_A79C98C1A76ED395');
        $this->addSql('DROP TABLE otp');
        $this->addSql('DROP TABLE token');
        $this->addSql('DROP TABLE user');
    }
}
