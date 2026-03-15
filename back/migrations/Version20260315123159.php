<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315123159 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create user, token, otp, and onboarding tables';
    }

    public function up(Schema $schema): void
    {
        // CREATE TABLEs
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, first_name VARCHAR(255) DEFAULT NULL, last_name VARCHAR(255) DEFAULT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, roles JSON NOT NULL, verified_at DATETIME DEFAULT NULL, stripe_customer_id VARCHAR(255) DEFAULT NULL, referral_code VARCHAR(8) DEFAULT NULL, ip_address VARCHAR(45) DEFAULT NULL, referred_by_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649D17F50A6 (uuid), UNIQUE INDEX UNIQ_8D93D6496447454A (referral_code), INDEX IDX_8D93D649758C8114 (referred_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE token (id INT AUTO_INCREMENT NOT NULL, value VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, expires_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_5F37A13BA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE otp (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, code VARCHAR(6) NOT NULL, type VARCHAR(255) NOT NULL, pending_otp_token VARCHAR(255) NOT NULL, attempts INT NOT NULL, used_at DATETIME DEFAULT NULL, expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_A79C98C1D17F50A6 (uuid), UNIQUE INDEX UNIQ_A79C98C18EEFEE15 (pending_otp_token), INDEX IDX_A79C98C1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE onboarding (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, completed_steps JSON NOT NULL, dismissed_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_23A7BB0EA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');

        // FKs
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649758C8114 FOREIGN KEY (referred_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE token ADD CONSTRAINT FK_5F37A13BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE otp ADD CONSTRAINT FK_A79C98C1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE onboarding ADD CONSTRAINT FK_23A7BB0EA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649758C8114');
        $this->addSql('ALTER TABLE token DROP FOREIGN KEY FK_5F37A13BA76ED395');
        $this->addSql('ALTER TABLE otp DROP FOREIGN KEY FK_A79C98C1A76ED395');
        $this->addSql('ALTER TABLE onboarding DROP FOREIGN KEY FK_23A7BB0EA76ED395');
        $this->addSql('DROP TABLE onboarding');
        $this->addSql('DROP TABLE otp');
        $this->addSql('DROP TABLE token');
        $this->addSql('DROP TABLE user');
    }
}
