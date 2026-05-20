<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260519142614 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE agency (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, contact_email VARCHAR(255) DEFAULT NULL, website VARCHAR(255) DEFAULT NULL, stripe_customer_id VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_70C0C6E6D17F50A6 (uuid), UNIQUE INDEX UNIQ_70C0C6E6708DC647 (stripe_customer_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE invitation (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, token VARCHAR(255) NOT NULL, type VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, role VARCHAR(255) DEFAULT NULL, expires_at DATETIME NOT NULL, used_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, agency_id INT NOT NULL, project_id INT DEFAULT NULL, created_by_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_F11D61A2D17F50A6 (uuid), UNIQUE INDEX UNIQ_F11D61A25F37A13B (token), INDEX IDX_F11D61A2CDEADB2A (agency_id), INDEX IDX_F11D61A2166D1F9C (project_id), INDEX IDX_F11D61A2B03A8386 (created_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_draft (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, notes LONGTEXT DEFAULT NULL, media_type VARCHAR(32) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, project_id INT NOT NULL, script_id INT DEFAULT NULL, created_by_id INT DEFAULT NULL, INDEX IDX_D1671A7B166D1F9C (project_id), UNIQUE INDEX UNIQ_D1671A7BA1C01850 (script_id), INDEX IDX_D1671A7BB03A8386 (created_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_draft_media_version (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, file_count SMALLINT NOT NULL, status VARCHAR(32) NOT NULL, video_streaming_status VARCHAR(32) DEFAULT NULL, video_streaming_failure_reason VARCHAR(32) DEFAULT NULL, created_at DATETIME NOT NULL, post_draft_id INT NOT NULL, INDEX IDX_C88FEF0C5D1E4C70 (post_draft_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE post_draft_media_version_comment (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, media_version_id INT NOT NULL, author_id INT DEFAULT NULL, INDEX IDX_74F875B74199E991 (media_version_id), INDEX IDX_74F875B7F675F31B (author_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE invitation ADD CONSTRAINT FK_F11D61A2CDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE invitation ADD CONSTRAINT FK_F11D61A2166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE invitation ADD CONSTRAINT FK_F11D61A2B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE post_draft ADD CONSTRAINT FK_D1671A7B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_draft ADD CONSTRAINT FK_D1671A7BA1C01850 FOREIGN KEY (script_id) REFERENCES script (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE post_draft ADD CONSTRAINT FK_D1671A7BB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE post_draft_media_version ADD CONSTRAINT FK_C88FEF0C5D1E4C70 FOREIGN KEY (post_draft_id) REFERENCES post_draft (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_draft_media_version_comment ADD CONSTRAINT FK_74F875B74199E991 FOREIGN KEY (media_version_id) REFERENCES post_draft_media_version (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_draft_media_version_comment ADD CONSTRAINT FK_74F875B7F675F31B FOREIGN KEY (author_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE credit_balance DROP FOREIGN KEY `FK_967078D1A76ED395`');
        $this->addSql('DROP INDEX UNIQ_967078D1A76ED395 ON credit_balance');
        $this->addSql('ALTER TABLE credit_balance CHANGE user_id agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE credit_balance ADD CONSTRAINT FK_967078D1CDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_967078D1CDEADB2A ON credit_balance (agency_id)');
        $this->addSql('ALTER TABLE credit_transaction DROP FOREIGN KEY `FK_5E1DE3E1A76ED395`');
        $this->addSql('DROP INDEX IDX_5E1DE3E1A76ED395 ON credit_transaction');
        $this->addSql('ALTER TABLE credit_transaction ADD created_by_id INT DEFAULT NULL, DROP user_id');
        $this->addSql('ALTER TABLE credit_transaction ADD CONSTRAINT FK_5E1DE3E1B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_5E1DE3E1B03A8386 ON credit_transaction (created_by_id)');
        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY `FK_B4C06FFCA76ED395`');
        $this->addSql('DROP INDEX IDX_B4C06FFCA76ED395 ON hook_template');
        $this->addSql('ALTER TABLE hook_template ADD created_by_id INT DEFAULT NULL, CHANGE user_id agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT FK_B4C06FFCCDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT FK_B4C06FFCB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_B4C06FFCCDEADB2A ON hook_template (agency_id)');
        $this->addSql('CREATE INDEX IDX_B4C06FFCB03A8386 ON hook_template (created_by_id)');
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY `FK_FDE96D9BA76ED395`');
        $this->addSql('DROP INDEX IDX_FDE96D9BA76ED395 ON integration');
        $this->addSql('ALTER TABLE integration ADD created_by_id INT DEFAULT NULL, DROP user_id');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9BB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_FDE96D9BB03A8386 ON integration (created_by_id)');
        $this->addSql('ALTER TABLE integration_insight DROP FOREIGN KEY `FK_9318A982A76ED395`');
        $this->addSql('DROP INDEX IDX_9318A982A76ED395 ON integration_insight');
        $this->addSql('ALTER TABLE integration_insight DROP user_id');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY `FK_5A8A6C8DA76ED395`');
        $this->addSql('DROP INDEX IDX_5A8A6C8DA76ED395 ON post');
        $this->addSql('ALTER TABLE post ADD created_by_id INT DEFAULT NULL, DROP user_id');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_5A8A6C8DB03A8386 ON post (created_by_id)');
        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY `FK_FADBC82AA76ED395`');
        $this->addSql('DROP INDEX IDX_FADBC82AA76ED395 ON post_group');
        $this->addSql('ALTER TABLE post_group ADD created_by_id INT DEFAULT NULL, DROP user_id');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT FK_FADBC82AB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_FADBC82AB03A8386 ON post_group (created_by_id)');
        $this->addSql('ALTER TABLE post_insight DROP FOREIGN KEY `FK_C3DCA4E8A76ED395`');
        $this->addSql('DROP INDEX IDX_C3DCA4E8A76ED395 ON post_insight');
        $this->addSql('ALTER TABLE post_insight DROP user_id');
        $this->addSql('ALTER TABLE post_insight_breakdown DROP FOREIGN KEY `FK_CF30449AA76ED395`');
        $this->addSql('DROP INDEX IDX_CF30449AA76ED395 ON post_insight_breakdown');
        $this->addSql('ALTER TABLE post_insight_breakdown DROP user_id');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY `FK_2FB3D0EEA76ED395`');
        $this->addSql('DROP INDEX IDX_2FB3D0EEA76ED395 ON project');
        $this->addSql('ALTER TABLE project CHANGE user_id agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EECDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_2FB3D0EECDEADB2A ON project (agency_id)');
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY `FK_A3C664D3A76ED395`');
        $this->addSql('DROP INDEX IDX_A3C664D3A76ED395 ON subscription');
        $this->addSql('ALTER TABLE subscription CHANGE user_id agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D3CDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_A3C664D3CDEADB2A ON subscription (agency_id)');
        $this->addSql('ALTER TABLE user ADD agency_id INT DEFAULT NULL, ADD project_id INT DEFAULT NULL, DROP stripe_customer_id');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649CDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_8D93D649CDEADB2A ON user (agency_id)');
        $this->addSql('CREATE INDEX IDX_8D93D649166D1F9C ON user (project_id)');
        $this->addSql('ALTER TABLE youtube_reporting_job DROP FOREIGN KEY `FK_F8CE95FFA76ED395`');
        $this->addSql('DROP INDEX IDX_F8CE95FFA76ED395 ON youtube_reporting_job');
        $this->addSql('ALTER TABLE youtube_reporting_job DROP user_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE invitation DROP FOREIGN KEY FK_F11D61A2CDEADB2A');
        $this->addSql('ALTER TABLE invitation DROP FOREIGN KEY FK_F11D61A2166D1F9C');
        $this->addSql('ALTER TABLE invitation DROP FOREIGN KEY FK_F11D61A2B03A8386');
        $this->addSql('ALTER TABLE post_draft DROP FOREIGN KEY FK_D1671A7B166D1F9C');
        $this->addSql('ALTER TABLE post_draft DROP FOREIGN KEY FK_D1671A7BA1C01850');
        $this->addSql('ALTER TABLE post_draft DROP FOREIGN KEY FK_D1671A7BB03A8386');
        $this->addSql('ALTER TABLE post_draft_media_version DROP FOREIGN KEY FK_C88FEF0C5D1E4C70');
        $this->addSql('ALTER TABLE post_draft_media_version_comment DROP FOREIGN KEY FK_74F875B74199E991');
        $this->addSql('ALTER TABLE post_draft_media_version_comment DROP FOREIGN KEY FK_74F875B7F675F31B');
        $this->addSql('DROP TABLE agency');
        $this->addSql('DROP TABLE invitation');
        $this->addSql('DROP TABLE post_draft');
        $this->addSql('DROP TABLE post_draft_media_version');
        $this->addSql('DROP TABLE post_draft_media_version_comment');
        $this->addSql('ALTER TABLE credit_balance DROP FOREIGN KEY FK_967078D1CDEADB2A');
        $this->addSql('DROP INDEX UNIQ_967078D1CDEADB2A ON credit_balance');
        $this->addSql('ALTER TABLE credit_balance CHANGE agency_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE credit_balance ADD CONSTRAINT `FK_967078D1A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_967078D1A76ED395 ON credit_balance (user_id)');
        $this->addSql('ALTER TABLE credit_transaction DROP FOREIGN KEY FK_5E1DE3E1B03A8386');
        $this->addSql('DROP INDEX IDX_5E1DE3E1B03A8386 ON credit_transaction');
        $this->addSql('ALTER TABLE credit_transaction ADD user_id INT NOT NULL, DROP created_by_id');
        $this->addSql('ALTER TABLE credit_transaction ADD CONSTRAINT `FK_5E1DE3E1A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_5E1DE3E1A76ED395 ON credit_transaction (user_id)');
        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY FK_B4C06FFCCDEADB2A');
        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY FK_B4C06FFCB03A8386');
        $this->addSql('DROP INDEX IDX_B4C06FFCCDEADB2A ON hook_template');
        $this->addSql('DROP INDEX IDX_B4C06FFCB03A8386 ON hook_template');
        $this->addSql('ALTER TABLE hook_template DROP created_by_id, CHANGE agency_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT `FK_B4C06FFCA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_B4C06FFCA76ED395 ON hook_template (user_id)');
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9BB03A8386');
        $this->addSql('DROP INDEX IDX_FDE96D9BB03A8386 ON integration');
        $this->addSql('ALTER TABLE integration ADD user_id INT NOT NULL, DROP created_by_id');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT `FK_FDE96D9BA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FDE96D9BA76ED395 ON integration (user_id)');
        $this->addSql('ALTER TABLE integration_insight ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE integration_insight ADD CONSTRAINT `FK_9318A982A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_9318A982A76ED395 ON integration_insight (user_id)');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DB03A8386');
        $this->addSql('DROP INDEX IDX_5A8A6C8DB03A8386 ON post');
        $this->addSql('ALTER TABLE post ADD user_id INT NOT NULL, DROP created_by_id');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT `FK_5A8A6C8DA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_5A8A6C8DA76ED395 ON post (user_id)');
        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY FK_FADBC82AB03A8386');
        $this->addSql('DROP INDEX IDX_FADBC82AB03A8386 ON post_group');
        $this->addSql('ALTER TABLE post_group ADD user_id INT NOT NULL, DROP created_by_id');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT `FK_FADBC82AA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FADBC82AA76ED395 ON post_group (user_id)');
        $this->addSql('ALTER TABLE post_insight ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE post_insight ADD CONSTRAINT `FK_C3DCA4E8A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_C3DCA4E8A76ED395 ON post_insight (user_id)');
        $this->addSql('ALTER TABLE post_insight_breakdown ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE post_insight_breakdown ADD CONSTRAINT `FK_CF30449AA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_CF30449AA76ED395 ON post_insight_breakdown (user_id)');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EECDEADB2A');
        $this->addSql('DROP INDEX IDX_2FB3D0EECDEADB2A ON project');
        $this->addSql('ALTER TABLE project CHANGE agency_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT `FK_2FB3D0EEA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_2FB3D0EEA76ED395 ON project (user_id)');
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D3CDEADB2A');
        $this->addSql('DROP INDEX IDX_A3C664D3CDEADB2A ON subscription');
        $this->addSql('ALTER TABLE subscription CHANGE agency_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT `FK_A3C664D3A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_A3C664D3A76ED395 ON subscription (user_id)');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649CDEADB2A');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649166D1F9C');
        $this->addSql('DROP INDEX IDX_8D93D649CDEADB2A ON user');
        $this->addSql('DROP INDEX IDX_8D93D649166D1F9C ON user');
        $this->addSql('ALTER TABLE user ADD stripe_customer_id VARCHAR(255) DEFAULT NULL, DROP agency_id, DROP project_id');
        $this->addSql('ALTER TABLE youtube_reporting_job ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE youtube_reporting_job ADD CONSTRAINT `FK_F8CE95FFA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_F8CE95FFA76ED395 ON youtube_reporting_job (user_id)');
    }
}
