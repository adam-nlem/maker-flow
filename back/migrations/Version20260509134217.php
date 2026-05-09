<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Schema-only changes for the Client Portal + Agency Workspace Phase 1.
 *
 * - Creates the `agency` table.
 * - Adds `user.agency_id` and `user.project_id` (both nullable, SET NULL).
 * - Adds nullable `agency_id` columns on project / subscription / credit_balance / hook_template
 *   without dropping the existing `user_id` columns or adding the agency FK yet.
 * - Adds nullable `created_by_id` on hook_template (with FK to user) without dropping `user_id`.
 * - Renames `user_id` → `created_by_id` (nullable, SET NULL) on integration / credit_transaction /
 *   post / post_group via CHANGE COLUMN — data-preserving.
 * - Drops `user_id` from auto-imported insight / job tables (no audit trail kept).
 *
 * The companion data migration (Version20260509134218) populates agencies, re-parents existing
 * rows, drops the now-orphaned `user_id` / `user.stripe_customer_id` columns, and tightens the
 * `agency_id` columns to NOT NULL with the FK to `agency`.
 */
final class Version20260509134217 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 1 schema: agency table, nullable agency_id/created_by_id columns, user.agency_id/project_id, drop user_id from auto-imported tables.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE agency (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, brand_color VARCHAR(7) DEFAULT NULL, contact_email VARCHAR(255) DEFAULT NULL, website VARCHAR(255) DEFAULT NULL, stripe_customer_id VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_70C0C6E6D17F50A6 (uuid), UNIQUE INDEX UNIQ_70C0C6E6708DC647 (stripe_customer_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');

        $this->addSql('ALTER TABLE user ADD agency_id INT DEFAULT NULL, ADD project_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649CDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_8D93D649CDEADB2A ON user (agency_id)');
        $this->addSql('CREATE INDEX IDX_8D93D649166D1F9C ON user (project_id)');

        $this->addSql('ALTER TABLE project ADD agency_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription ADD agency_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE credit_balance ADD agency_id INT DEFAULT NULL');

        $this->addSql('ALTER TABLE hook_template ADD agency_id INT DEFAULT NULL, ADD created_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT FK_B4C06FFCB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_B4C06FFCB03A8386 ON hook_template (created_by_id)');

        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY `FK_FDE96D9BA76ED395`');
        $this->addSql('DROP INDEX IDX_FDE96D9BA76ED395 ON integration');
        $this->addSql('ALTER TABLE integration CHANGE user_id created_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9BB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_FDE96D9BB03A8386 ON integration (created_by_id)');

        $this->addSql('ALTER TABLE credit_transaction DROP FOREIGN KEY `FK_5E1DE3E1A76ED395`');
        $this->addSql('DROP INDEX IDX_5E1DE3E1A76ED395 ON credit_transaction');
        $this->addSql('ALTER TABLE credit_transaction CHANGE user_id created_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE credit_transaction ADD CONSTRAINT FK_5E1DE3E1B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_5E1DE3E1B03A8386 ON credit_transaction (created_by_id)');

        $this->addSql('ALTER TABLE post DROP FOREIGN KEY `FK_5A8A6C8DA76ED395`');
        $this->addSql('DROP INDEX IDX_5A8A6C8DA76ED395 ON post');
        $this->addSql('ALTER TABLE post CHANGE user_id created_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_5A8A6C8DB03A8386 ON post (created_by_id)');

        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY `FK_FADBC82AA76ED395`');
        $this->addSql('DROP INDEX IDX_FADBC82AA76ED395 ON post_group');
        $this->addSql('ALTER TABLE post_group CHANGE user_id created_by_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT FK_FADBC82AB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_FADBC82AB03A8386 ON post_group (created_by_id)');

        $this->addSql('ALTER TABLE integration_insight DROP FOREIGN KEY `FK_9318A982A76ED395`');
        $this->addSql('DROP INDEX IDX_9318A982A76ED395 ON integration_insight');
        $this->addSql('ALTER TABLE integration_insight DROP user_id');

        $this->addSql('ALTER TABLE post_insight DROP FOREIGN KEY `FK_C3DCA4E8A76ED395`');
        $this->addSql('DROP INDEX IDX_C3DCA4E8A76ED395 ON post_insight');
        $this->addSql('ALTER TABLE post_insight DROP user_id');

        $this->addSql('ALTER TABLE post_insight_breakdown DROP FOREIGN KEY `FK_CF30449AA76ED395`');
        $this->addSql('DROP INDEX IDX_CF30449AA76ED395 ON post_insight_breakdown');
        $this->addSql('ALTER TABLE post_insight_breakdown DROP user_id');

        $this->addSql('ALTER TABLE youtube_reporting_job DROP FOREIGN KEY `FK_F8CE95FFA76ED395`');
        $this->addSql('DROP INDEX IDX_F8CE95FFA76ED395 ON youtube_reporting_job');
        $this->addSql('ALTER TABLE youtube_reporting_job DROP user_id');
    }

    public function down(Schema $schema): void
    {
        // Re-add user_id with DEFAULT 0 on auto-imported tables (CASCADE FK will fail if users
        // don't include id=0 — best-effort reversal, mirrors prior project convention).
        $this->addSql('ALTER TABLE youtube_reporting_job ADD user_id INT NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE youtube_reporting_job ADD CONSTRAINT `FK_F8CE95FFA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_F8CE95FFA76ED395 ON youtube_reporting_job (user_id)');

        $this->addSql('ALTER TABLE post_insight_breakdown ADD user_id INT NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE post_insight_breakdown ADD CONSTRAINT `FK_CF30449AA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_CF30449AA76ED395 ON post_insight_breakdown (user_id)');

        $this->addSql('ALTER TABLE post_insight ADD user_id INT NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE post_insight ADD CONSTRAINT `FK_C3DCA4E8A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_C3DCA4E8A76ED395 ON post_insight (user_id)');

        $this->addSql('ALTER TABLE integration_insight ADD user_id INT NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE integration_insight ADD CONSTRAINT `FK_9318A982A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_9318A982A76ED395 ON integration_insight (user_id)');

        $this->addSql('ALTER TABLE post_group DROP FOREIGN KEY FK_FADBC82AB03A8386');
        $this->addSql('DROP INDEX IDX_FADBC82AB03A8386 ON post_group');
        $this->addSql('ALTER TABLE post_group CHANGE created_by_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE post_group ADD CONSTRAINT `FK_FADBC82AA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FADBC82AA76ED395 ON post_group (user_id)');

        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DB03A8386');
        $this->addSql('DROP INDEX IDX_5A8A6C8DB03A8386 ON post');
        $this->addSql('ALTER TABLE post CHANGE created_by_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT `FK_5A8A6C8DA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_5A8A6C8DA76ED395 ON post (user_id)');

        $this->addSql('ALTER TABLE credit_transaction DROP FOREIGN KEY FK_5E1DE3E1B03A8386');
        $this->addSql('DROP INDEX IDX_5E1DE3E1B03A8386 ON credit_transaction');
        $this->addSql('ALTER TABLE credit_transaction CHANGE created_by_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE credit_transaction ADD CONSTRAINT `FK_5E1DE3E1A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_5E1DE3E1A76ED395 ON credit_transaction (user_id)');

        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9BB03A8386');
        $this->addSql('DROP INDEX IDX_FDE96D9BB03A8386 ON integration');
        $this->addSql('ALTER TABLE integration CHANGE created_by_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT `FK_FDE96D9BA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FDE96D9BA76ED395 ON integration (user_id)');

        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY FK_B4C06FFCB03A8386');
        $this->addSql('DROP INDEX IDX_B4C06FFCB03A8386 ON hook_template');
        $this->addSql('ALTER TABLE hook_template DROP agency_id, DROP created_by_id');

        $this->addSql('ALTER TABLE credit_balance DROP agency_id');
        $this->addSql('ALTER TABLE subscription DROP agency_id');
        $this->addSql('ALTER TABLE project DROP agency_id');

        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649CDEADB2A');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649166D1F9C');
        $this->addSql('DROP INDEX IDX_8D93D649CDEADB2A ON user');
        $this->addSql('DROP INDEX IDX_8D93D649166D1F9C ON user');
        $this->addSql('ALTER TABLE user DROP agency_id, DROP project_id');

        $this->addSql('DROP TABLE agency');
    }
}
