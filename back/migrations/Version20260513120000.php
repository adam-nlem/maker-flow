<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Extends agency theming from a single brand color to a full palette + typography:
 *  - Renames `brand_color` → `accent_color` (preserves existing values).
 *  - Adds nullable `background_color`, `background_secondary_color`, `text_color`,
 *    `text_secondary_color` (VARCHAR(7) hex), and `heading_font`, `body_font` (VARCHAR(64)).
 *
 * All new columns are nullable; an empty value means the MakerFlow default is used.
 */
final class Version20260513120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Agency theming: rename brand_color → accent_color and add background/text colors + heading/body font columns.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE agency CHANGE brand_color accent_color VARCHAR(7) DEFAULT NULL');
        $this->addSql('ALTER TABLE agency ADD background_color VARCHAR(7) DEFAULT NULL');
        $this->addSql('ALTER TABLE agency ADD background_secondary_color VARCHAR(7) DEFAULT NULL');
        $this->addSql('ALTER TABLE agency ADD text_color VARCHAR(7) DEFAULT NULL');
        $this->addSql('ALTER TABLE agency ADD text_secondary_color VARCHAR(7) DEFAULT NULL');
        $this->addSql('ALTER TABLE agency ADD heading_font VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE agency ADD body_font VARCHAR(64) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE agency DROP body_font');
        $this->addSql('ALTER TABLE agency DROP heading_font');
        $this->addSql('ALTER TABLE agency DROP text_secondary_color');
        $this->addSql('ALTER TABLE agency DROP text_color');
        $this->addSql('ALTER TABLE agency DROP background_secondary_color');
        $this->addSql('ALTER TABLE agency DROP background_color');
        $this->addSql('ALTER TABLE agency CHANGE accent_color brand_color VARCHAR(7) DEFAULT NULL');
    }
}
