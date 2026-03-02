<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260302065058 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE credit_balance (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, subscription_credits INT NOT NULL, topup_credits INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_967078D1D17F50A6 (uuid), UNIQUE INDEX UNIQ_967078D1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE stripe_webhook_event (id INT AUTO_INCREMENT NOT NULL, stripe_event_id VARCHAR(255) NOT NULL, event_type VARCHAR(255) NOT NULL, processed_at DATETIME NOT NULL, payload JSON NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_41BD93F52CB034B8 (stripe_event_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE credit_balance ADD CONSTRAINT FK_967078D1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE credit_pack DROP FOREIGN KEY `FK_901CE11EA76ED395`');
        $this->addSql('DROP TABLE credit_pack');
        $this->addSql('ALTER TABLE credit_transaction ADD source_bucket VARCHAR(255) NOT NULL, ADD balance_after INT NOT NULL, ADD stripe_payment_intent_id VARCHAR(255) DEFAULT NULL, ADD stripe_invoice_id VARCHAR(255) DEFAULT NULL, ADD credit_balance_id INT NOT NULL, CHANGE description description LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE credit_transaction ADD CONSTRAINT FK_5E1DE3E15DE91863 FOREIGN KEY (credit_balance_id) REFERENCES credit_balance (id) ON DELETE CASCADE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_5E1DE3E1D17F50A6 ON credit_transaction (uuid)');
        $this->addSql('CREATE INDEX IDX_5E1DE3E15DE91863 ON credit_transaction (credit_balance_id)');
        $this->addSql('ALTER TABLE subscription DROP INDEX IDX_A3C664D3A76ED395, ADD UNIQUE INDEX UNIQ_A3C664D3A76ED395 (user_id)');
        $this->addSql('ALTER TABLE subscription ADD cancel_at_period_end TINYINT(1) NOT NULL, DROP credits_per_period, DROP remaining_subscription_credits, DROP canceled_at, DROP plan_limits, CHANGE stripe_price_id stripe_customer_id VARCHAR(255) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A3C664D3D17F50A6 ON subscription (uuid)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A3C664D3B5DBB761 ON subscription (stripe_subscription_id)');
        $this->addSql('ALTER TABLE user DROP stripe_customer_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE credit_pack (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, stripe_payment_intent_id VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, credits INT NOT NULL, remaining_credits INT NOT NULL, purchased_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_901CE11EA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE credit_pack ADD CONSTRAINT `FK_901CE11EA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE credit_balance DROP FOREIGN KEY FK_967078D1A76ED395');
        $this->addSql('DROP TABLE credit_balance');
        $this->addSql('DROP TABLE stripe_webhook_event');
        $this->addSql('ALTER TABLE credit_transaction DROP FOREIGN KEY FK_5E1DE3E15DE91863');
        $this->addSql('DROP INDEX UNIQ_5E1DE3E1D17F50A6 ON credit_transaction');
        $this->addSql('DROP INDEX IDX_5E1DE3E15DE91863 ON credit_transaction');
        $this->addSql('ALTER TABLE credit_transaction DROP source_bucket, DROP balance_after, DROP stripe_payment_intent_id, DROP stripe_invoice_id, DROP credit_balance_id, CHANGE description description VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription DROP INDEX UNIQ_A3C664D3A76ED395, ADD INDEX IDX_A3C664D3A76ED395 (user_id)');
        $this->addSql('DROP INDEX UNIQ_A3C664D3D17F50A6 ON subscription');
        $this->addSql('DROP INDEX UNIQ_A3C664D3B5DBB761 ON subscription');
        $this->addSql('ALTER TABLE subscription ADD credits_per_period INT NOT NULL, ADD remaining_subscription_credits INT NOT NULL, ADD canceled_at DATETIME DEFAULT NULL, ADD plan_limits JSON DEFAULT NULL, DROP cancel_at_period_end, CHANGE stripe_customer_id stripe_price_id VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE user ADD stripe_customer_id VARCHAR(255) DEFAULT NULL');
    }
}
