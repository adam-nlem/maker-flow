<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Data migration that seeds agencies, re-parents existing rows from user → agency, and
 * tightens the `agency_id` columns to NOT NULL with the FK to `agency`.
 *
 * Order of operations:
 *  1. INSERT one agency per user. Use user.email as agency.contact_email — both as a sensible
 *     default and as a deterministic join key for step 2.
 *  2. UPDATE user.agency_id by joining agency on contact_email = email.
 *  3. Backfill agency_id on project / subscription / credit_balance / hook_template via the
 *     still-present user_id columns. For hook_template, also copy user_id → created_by_id.
 *  4. Seed roles: every non-client user becomes ROLE_ADMIN of their auto-created agency.
 *  5. Drop the now-orphaned user_id columns, set agency_id NOT NULL, add FK to agency,
 *     re-create indexes (and the UNIQUE on credit_balance.agency_id).
 *  6. Drop user.stripe_customer_id (now stored on agency).
 *
 * Note on user.project_id: not backfilled here. ROLE_CLIENT users do not exist before this
 * migration, and the project assignment is an application-level decision (agency staff picks
 * which project a client lands on). The column stays nullable; agency staff fill it via the UI.
 */
final class Version20260509134218 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 1 data: create one agency per user, re-parent existing rows, tighten agency_id NOT NULL, drop user.stripe_customer_id.';
    }

    public function up(Schema $schema): void
    {
        // 1. Create one agency per user. Carry stripe_customer_id over and store user.email
        //    as agency.contact_email so step 2 can join on a unique value.
        $this->addSql(<<<'SQL'
            INSERT INTO agency (uuid, name, stripe_customer_id, contact_email, created_at, updated_at)
            SELECT
                UUID(),
                COALESCE(NULLIF(TRIM(first_name), ''), email),
                stripe_customer_id,
                email,
                NOW(),
                NOW()
            FROM user
        SQL);

        // 2. Point each user at their freshly-created agency.
        $this->addSql('UPDATE user u JOIN agency a ON a.contact_email = u.email SET u.agency_id = a.id');

        // 3. Re-parent child rows via the still-present user_id columns.
        $this->addSql('UPDATE project p JOIN user u ON p.user_id = u.id SET p.agency_id = u.agency_id');
        $this->addSql('UPDATE subscription s JOIN user u ON s.user_id = u.id SET s.agency_id = u.agency_id');
        $this->addSql('UPDATE credit_balance cb JOIN user u ON cb.user_id = u.id SET cb.agency_id = u.agency_id');
        $this->addSql('UPDATE hook_template ht JOIN user u ON ht.user_id = u.id SET ht.agency_id = u.agency_id, ht.created_by_id = ht.user_id');

        // 4. Promote every non-client user to admin of their own agency.
        $this->addSql(<<<'SQL'
            UPDATE user
            SET roles = JSON_ARRAY('ROLE_USER', 'ROLE_ADMIN')
            WHERE NOT JSON_CONTAINS(roles, '"ROLE_CLIENT"')
        SQL);

        // 5. Tighten the schema now that data is in place.
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY `FK_2FB3D0EEA76ED395`');
        $this->addSql('DROP INDEX IDX_2FB3D0EEA76ED395 ON project');
        $this->addSql('ALTER TABLE project DROP user_id');
        $this->addSql('ALTER TABLE project MODIFY agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EECDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_2FB3D0EECDEADB2A ON project (agency_id)');

        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY `FK_A3C664D3A76ED395`');
        $this->addSql('DROP INDEX IDX_A3C664D3A76ED395 ON subscription');
        $this->addSql('ALTER TABLE subscription DROP user_id');
        $this->addSql('ALTER TABLE subscription MODIFY agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D3CDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_A3C664D3CDEADB2A ON subscription (agency_id)');

        $this->addSql('ALTER TABLE credit_balance DROP FOREIGN KEY `FK_967078D1A76ED395`');
        $this->addSql('DROP INDEX UNIQ_967078D1A76ED395 ON credit_balance');
        $this->addSql('ALTER TABLE credit_balance DROP user_id');
        $this->addSql('ALTER TABLE credit_balance MODIFY agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE credit_balance ADD CONSTRAINT FK_967078D1CDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_967078D1CDEADB2A ON credit_balance (agency_id)');

        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY `FK_B4C06FFCA76ED395`');
        $this->addSql('DROP INDEX IDX_B4C06FFCA76ED395 ON hook_template');
        $this->addSql('ALTER TABLE hook_template DROP user_id');
        $this->addSql('ALTER TABLE hook_template MODIFY agency_id INT NOT NULL');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT FK_B4C06FFCCDEADB2A FOREIGN KEY (agency_id) REFERENCES agency (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_B4C06FFCCDEADB2A ON hook_template (agency_id)');

        // 6. stripe_customer_id now lives on agency.
        $this->addSql('ALTER TABLE user DROP stripe_customer_id');
    }

    public function down(Schema $schema): void
    {
        // Best-effort reversal: re-add user_id and stripe_customer_id, then copy values back.
        // Data created post-up() (new users without a stripe id, agencies with multiple
        // users / projects) cannot be fully restored.

        $this->addSql('ALTER TABLE user ADD stripe_customer_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('UPDATE user u JOIN agency a ON a.id = u.agency_id SET u.stripe_customer_id = a.stripe_customer_id');

        $this->addSql('ALTER TABLE hook_template DROP FOREIGN KEY FK_B4C06FFCCDEADB2A');
        $this->addSql('DROP INDEX IDX_B4C06FFCCDEADB2A ON hook_template');
        $this->addSql('ALTER TABLE hook_template ADD user_id INT DEFAULT NULL');
        $this->addSql('UPDATE hook_template SET user_id = created_by_id');
        $this->addSql('ALTER TABLE hook_template MODIFY user_id INT NOT NULL');
        $this->addSql('ALTER TABLE hook_template ADD CONSTRAINT `FK_B4C06FFCA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_B4C06FFCA76ED395 ON hook_template (user_id)');

        $this->addSql('ALTER TABLE credit_balance DROP FOREIGN KEY FK_967078D1CDEADB2A');
        $this->addSql('DROP INDEX UNIQ_967078D1CDEADB2A ON credit_balance');
        $this->addSql('ALTER TABLE credit_balance ADD user_id INT DEFAULT NULL');
        $this->addSql('UPDATE credit_balance cb JOIN user u ON u.agency_id = cb.agency_id SET cb.user_id = u.id');
        $this->addSql('ALTER TABLE credit_balance MODIFY user_id INT NOT NULL');
        $this->addSql('ALTER TABLE credit_balance ADD CONSTRAINT `FK_967078D1A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_967078D1A76ED395 ON credit_balance (user_id)');

        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D3CDEADB2A');
        $this->addSql('DROP INDEX IDX_A3C664D3CDEADB2A ON subscription');
        $this->addSql('ALTER TABLE subscription ADD user_id INT DEFAULT NULL');
        $this->addSql('UPDATE subscription s JOIN user u ON u.agency_id = s.agency_id SET s.user_id = u.id');
        $this->addSql('ALTER TABLE subscription MODIFY user_id INT NOT NULL');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT `FK_A3C664D3A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_A3C664D3A76ED395 ON subscription (user_id)');

        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EECDEADB2A');
        $this->addSql('DROP INDEX IDX_2FB3D0EECDEADB2A ON project');
        $this->addSql('ALTER TABLE project ADD user_id INT DEFAULT NULL');
        $this->addSql('UPDATE project p JOIN user u ON u.agency_id = p.agency_id SET p.user_id = u.id');
        $this->addSql('ALTER TABLE project MODIFY user_id INT NOT NULL');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT `FK_2FB3D0EEA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_2FB3D0EEA76ED395 ON project (user_id)');

        // Roles are not reverted: this migration cannot tell which users were ROLE_ADMIN before.
        // hook_template.created_by_id stays as-is (it's a sibling field, not derived from agency_id).
        // Agencies are kept too — dropping them happens in the schema migration's down().
    }
}
