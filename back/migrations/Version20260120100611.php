<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260120100611 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE social_analytics_integration_insight (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, type VARCHAR(255) NOT NULL, value INT NOT NULL, integration_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_AF03F0459E82DDEA (integration_id), INDEX IDX_AF03F045A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE social_analytics_post (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, external_id VARCHAR(255) NOT NULL, media_type VARCHAR(255) NOT NULL, duration INT NOT NULL, caption LONGTEXT DEFAULT NULL, integration_id INT NOT NULL, social_analytics_post_group_id INT DEFAULT NULL, user_id INT NOT NULL, INDEX IDX_B4434DBA9E82DDEA (integration_id), INDEX IDX_B4434DBA4BFE3F9F (social_analytics_post_group_id), INDEX IDX_B4434DBAA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE social_analytics_post_group (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, title VARCHAR(255) NOT NULL, user_id INT NOT NULL, user_module_id INT NOT NULL, INDEX IDX_B73CA5ADA76ED395 (user_id), INDEX IDX_B73CA5ADAF223875 (user_module_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE social_analytics_post_insight (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, type VARCHAR(255) NOT NULL, value INT NOT NULL, social_analytics_post_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_841DFA6648A9F20 (social_analytics_post_id), INDEX IDX_841DFA66A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE social_analytics_integration_insight ADD CONSTRAINT FK_AF03F0459E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE social_analytics_integration_insight ADD CONSTRAINT FK_AF03F045A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE social_analytics_post ADD CONSTRAINT FK_B4434DBA9E82DDEA FOREIGN KEY (integration_id) REFERENCES integration (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE social_analytics_post ADD CONSTRAINT FK_B4434DBA4BFE3F9F FOREIGN KEY (social_analytics_post_group_id) REFERENCES social_analytics_post_group (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE social_analytics_post ADD CONSTRAINT FK_B4434DBAA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE social_analytics_post_group ADD CONSTRAINT FK_B73CA5ADA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE social_analytics_post_group ADD CONSTRAINT FK_B73CA5ADAF223875 FOREIGN KEY (user_module_id) REFERENCES user_module (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE social_analytics_post_insight ADD CONSTRAINT FK_841DFA6648A9F20 FOREIGN KEY (social_analytics_post_id) REFERENCES social_analytics_post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE social_analytics_post_insight ADD CONSTRAINT FK_841DFA66A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    
        $this->addSql("INSERT INTO module (uuid, title, description, is_active, is_premium, created_at, module_identifier) VALUES (UUID(), 'Social Analytics', 'Track and analyze your social media performance across platforms.', 1, 1, NOW(), 'social_analytics')");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE social_analytics_integration_insight DROP FOREIGN KEY FK_AF03F0459E82DDEA');
        $this->addSql('ALTER TABLE social_analytics_integration_insight DROP FOREIGN KEY FK_AF03F045A76ED395');
        $this->addSql('ALTER TABLE social_analytics_post DROP FOREIGN KEY FK_B4434DBA9E82DDEA');
        $this->addSql('ALTER TABLE social_analytics_post DROP FOREIGN KEY FK_B4434DBA4BFE3F9F');
        $this->addSql('ALTER TABLE social_analytics_post DROP FOREIGN KEY FK_B4434DBAA76ED395');
        $this->addSql('ALTER TABLE social_analytics_post_group DROP FOREIGN KEY FK_B73CA5ADA76ED395');
        $this->addSql('ALTER TABLE social_analytics_post_group DROP FOREIGN KEY FK_B73CA5ADAF223875');
        $this->addSql('ALTER TABLE social_analytics_post_insight DROP FOREIGN KEY FK_841DFA6648A9F20');
        $this->addSql('ALTER TABLE social_analytics_post_insight DROP FOREIGN KEY FK_841DFA66A76ED395');
        $this->addSql('DROP TABLE social_analytics_integration_insight');
        $this->addSql('DROP TABLE social_analytics_post');
        $this->addSql('DROP TABLE social_analytics_post_group');
        $this->addSql('DROP TABLE social_analytics_post_insight');
    }
}
