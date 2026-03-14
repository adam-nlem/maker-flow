<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314131216 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create billing tables: credit_balance, credit_transaction, stripe_webhook_event, subscription';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE credit_balance (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, subscription_credits INT NOT NULL, refill_credits INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_967078D1D17F50A6 (uuid), UNIQUE INDEX UNIQ_967078D1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE credit_transaction (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, amount INT NOT NULL, type VARCHAR(255) NOT NULL, source_bucket VARCHAR(255) NOT NULL, balance_after INT NOT NULL, stripe_payment_intent_id VARCHAR(255) DEFAULT NULL, stripe_invoice_id VARCHAR(255) DEFAULT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, credit_balance_id INT NOT NULL, UNIQUE INDEX UNIQ_5E1DE3E1D17F50A6 (uuid), INDEX IDX_5E1DE3E1A76ED395 (user_id), INDEX IDX_5E1DE3E15DE91863 (credit_balance_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE stripe_webhook_event (id INT AUTO_INCREMENT NOT NULL, stripe_event_id VARCHAR(255) NOT NULL, event_type VARCHAR(255) NOT NULL, processed_at DATETIME NOT NULL, payload JSON NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_41BD93F52CB034B8 (stripe_event_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE subscription (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, stripe_subscription_id VARCHAR(255) NOT NULL, plan VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, current_period_start DATETIME NOT NULL, current_period_end DATETIME NOT NULL, cancel_at_period_end TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_A3C664D3D17F50A6 (uuid), UNIQUE INDEX UNIQ_A3C664D3B5DBB761 (stripe_subscription_id), INDEX IDX_A3C664D3A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE credit_balance ADD CONSTRAINT FK_967078D1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE credit_transaction ADD CONSTRAINT FK_5E1DE3E1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE credit_transaction ADD CONSTRAINT FK_5E1DE3E15DE91863 FOREIGN KEY (credit_balance_id) REFERENCES credit_balance (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D3A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE credit_balance DROP FOREIGN KEY FK_967078D1A76ED395');
        $this->addSql('ALTER TABLE credit_transaction DROP FOREIGN KEY FK_5E1DE3E1A76ED395');
        $this->addSql('ALTER TABLE credit_transaction DROP FOREIGN KEY FK_5E1DE3E15DE91863');
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D3A76ED395');
        $this->addSql('DROP TABLE credit_balance');
        $this->addSql('DROP TABLE credit_transaction');
        $this->addSql('DROP TABLE stripe_webhook_event');
        $this->addSql('DROP TABLE subscription');
    }
}
