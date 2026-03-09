<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260309075549 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE otp (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, code VARCHAR(6) NOT NULL, type VARCHAR(255) NOT NULL, pending_otp_token VARCHAR(255) NOT NULL, attempts INT NOT NULL, used_at DATETIME DEFAULT NULL, expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_A79C98C1D17F50A6 (uuid), UNIQUE INDEX UNIQ_A79C98C18EEFEE15 (pending_otp_token), INDEX IDX_A79C98C1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE otp ADD CONSTRAINT FK_A79C98C1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user ADD verified_at DATETIME DEFAULT NULL');
        $this->addSql('UPDATE user SET verified_at = NOW() WHERE verified_at IS NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE otp DROP FOREIGN KEY FK_A79C98C1A76ED395');
        $this->addSql('DROP TABLE otp');
        $this->addSql('ALTER TABLE user DROP verified_at');
    }
}
