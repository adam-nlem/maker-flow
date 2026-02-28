<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260228090249 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE script_call_to_action ADD script_generation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_call_to_action ADD CONSTRAINT FK_AF7D247911CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_AF7D247911CE609 ON script_call_to_action (script_generation_id)');
        $this->addSql('ALTER TABLE script_chapter ADD script_generation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_chapter ADD CONSTRAINT FK_A489726411CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_A489726411CE609 ON script_chapter (script_generation_id)');
        $this->addSql('ALTER TABLE script_dialogue ADD script_generation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_dialogue ADD CONSTRAINT FK_67DEBC7011CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_67DEBC7011CE609 ON script_dialogue (script_generation_id)');
        $this->addSql('ALTER TABLE script_generation DROP replace_existing');
        $this->addSql('ALTER TABLE script_retention_cue ADD script_generation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_retention_cue ADD CONSTRAINT FK_836438FD11CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_836438FD11CE609 ON script_retention_cue (script_generation_id)');
        $this->addSql('ALTER TABLE script_shot ADD script_generation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_shot ADD CONSTRAINT FK_6BBDFAEF11CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_6BBDFAEF11CE609 ON script_shot (script_generation_id)');
        $this->addSql('ALTER TABLE script_text ADD script_generation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_text ADD CONSTRAINT FK_FB31D59311CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FB31D59311CE609 ON script_text (script_generation_id)');
        $this->addSql('ALTER TABLE script_voice_over ADD script_generation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE script_voice_over ADD CONSTRAINT FK_6E52457211CE609 FOREIGN KEY (script_generation_id) REFERENCES script_generation (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_6E52457211CE609 ON script_voice_over (script_generation_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE script_call_to_action DROP FOREIGN KEY FK_AF7D247911CE609');
        $this->addSql('DROP INDEX IDX_AF7D247911CE609 ON script_call_to_action');
        $this->addSql('ALTER TABLE script_call_to_action DROP script_generation_id');
        $this->addSql('ALTER TABLE script_chapter DROP FOREIGN KEY FK_A489726411CE609');
        $this->addSql('DROP INDEX IDX_A489726411CE609 ON script_chapter');
        $this->addSql('ALTER TABLE script_chapter DROP script_generation_id');
        $this->addSql('ALTER TABLE script_dialogue DROP FOREIGN KEY FK_67DEBC7011CE609');
        $this->addSql('DROP INDEX IDX_67DEBC7011CE609 ON script_dialogue');
        $this->addSql('ALTER TABLE script_dialogue DROP script_generation_id');
        $this->addSql('ALTER TABLE script_generation ADD replace_existing TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE script_retention_cue DROP FOREIGN KEY FK_836438FD11CE609');
        $this->addSql('DROP INDEX IDX_836438FD11CE609 ON script_retention_cue');
        $this->addSql('ALTER TABLE script_retention_cue DROP script_generation_id');
        $this->addSql('ALTER TABLE script_shot DROP FOREIGN KEY FK_6BBDFAEF11CE609');
        $this->addSql('DROP INDEX IDX_6BBDFAEF11CE609 ON script_shot');
        $this->addSql('ALTER TABLE script_shot DROP script_generation_id');
        $this->addSql('ALTER TABLE script_text DROP FOREIGN KEY FK_FB31D59311CE609');
        $this->addSql('DROP INDEX IDX_FB31D59311CE609 ON script_text');
        $this->addSql('ALTER TABLE script_text DROP script_generation_id');
        $this->addSql('ALTER TABLE script_voice_over DROP FOREIGN KEY FK_6E52457211CE609');
        $this->addSql('DROP INDEX IDX_6E52457211CE609 ON script_voice_over');
        $this->addSql('ALTER TABLE script_voice_over DROP script_generation_id');
    }
}
