<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260110093024 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY `FK_FDE96D9BA76ED395`');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT FK_FDE96D9BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY `FK_2FB3D0EEA76ED395`');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY `FK_1B199E07A76ED395`');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY `FK_1B199E07AF223875`');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT FK_1B199E07A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT FK_1B199E07AF223875 FOREIGN KEY (user_module_id) REFERENCES user_module (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY `FK_35DD63CEA76ED395`');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY `FK_35DD63CEE8A7DCFA`');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT FK_35DD63CEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT FK_35DD63CEE8A7DCFA FOREIGN KEY (todo_list_id) REFERENCES todo_list (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY `FK_5A25B2DCA76ED395`');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY `FK_5A25B2DCE8A7DCFA`');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT FK_5A25B2DCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT FK_5A25B2DCE8A7DCFA FOREIGN KEY (todo_list_id) REFERENCES todo_list (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE token DROP FOREIGN KEY `FK_5F37A13BA76ED395`');
        $this->addSql('ALTER TABLE token ADD CONSTRAINT FK_5F37A13BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY `FK_69763D15166D1F9C`');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY `FK_69763D15A76ED395`');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE integration DROP FOREIGN KEY FK_FDE96D9BA76ED395');
        $this->addSql('ALTER TABLE integration ADD CONSTRAINT `FK_FDE96D9BA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT `FK_2FB3D0EEA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY FK_1B199E07A76ED395');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY FK_1B199E07AF223875');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT `FK_1B199E07A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT `FK_1B199E07AF223875` FOREIGN KEY (user_module_id) REFERENCES user_module (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY FK_35DD63CEA76ED395');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY FK_35DD63CEE8A7DCFA');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT `FK_35DD63CEA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT `FK_35DD63CEE8A7DCFA` FOREIGN KEY (todo_list_id) REFERENCES todo_list (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY FK_5A25B2DCA76ED395');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY FK_5A25B2DCE8A7DCFA');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT `FK_5A25B2DCA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT `FK_5A25B2DCE8A7DCFA` FOREIGN KEY (todo_list_id) REFERENCES todo_list (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE token DROP FOREIGN KEY FK_5F37A13BA76ED395');
        $this->addSql('ALTER TABLE token ADD CONSTRAINT `FK_5F37A13BA76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15A76ED395');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15166D1F9C');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT `FK_69763D15A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT `FK_69763D15166D1F9C` FOREIGN KEY (project_id) REFERENCES project (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
