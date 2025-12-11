<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251211154805 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE project (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, finished_at DATETIME DEFAULT NULL, types LONGTEXT NOT NULL, user_id INT NOT NULL, INDEX IDX_2FB3D0EEA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, user_module_id INT NOT NULL, INDEX IDX_1B199E07A76ED395 (user_id), INDEX IDX_1B199E07AF223875 (user_module_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list_tag (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, color VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, todo_list_id INT NOT NULL, INDEX IDX_35DD63CEA76ED395 (user_id), INDEX IDX_35DD63CEE8A7DCFA (todo_list_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list_task (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT DEFAULT NULL, status VARCHAR(255) NOT NULL, priority VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, finished_at DATETIME DEFAULT NULL, due_date DATETIME DEFAULT NULL, user_id INT NOT NULL, todo_list_id INT NOT NULL, INDEX IDX_5A25B2DCA76ED395 (user_id), INDEX IDX_5A25B2DCE8A7DCFA (todo_list_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_list_task_todo_list_tag (todo_list_task_id INT NOT NULL, todo_list_tag_id INT NOT NULL, INDEX IDX_C9CCC2897F251143 (todo_list_task_id), INDEX IDX_C9CCC2894BC2E842 (todo_list_tag_id), PRIMARY KEY (todo_list_task_id, todo_list_tag_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT FK_1B199E07A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE todo_list ADD CONSTRAINT FK_1B199E07AF223875 FOREIGN KEY (user_module_id) REFERENCES user_module (id)');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT FK_35DD63CEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE todo_list_tag ADD CONSTRAINT FK_35DD63CEE8A7DCFA FOREIGN KEY (todo_list_id) REFERENCES todo_list (id)');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT FK_5A25B2DCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE todo_list_task ADD CONSTRAINT FK_5A25B2DCE8A7DCFA FOREIGN KEY (todo_list_id) REFERENCES todo_list (id)');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag ADD CONSTRAINT FK_C9CCC2897F251143 FOREIGN KEY (todo_list_task_id) REFERENCES todo_list_task (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag ADD CONSTRAINT FK_C9CCC2894BC2E842 FOREIGN KEY (todo_list_tag_id) REFERENCES todo_list_tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_module ADD project_id INT NOT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE user_module ADD CONSTRAINT FK_69763D15166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('CREATE INDEX IDX_69763D15166D1F9C ON user_module (project_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY FK_1B199E07A76ED395');
        $this->addSql('ALTER TABLE todo_list DROP FOREIGN KEY FK_1B199E07AF223875');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY FK_35DD63CEA76ED395');
        $this->addSql('ALTER TABLE todo_list_tag DROP FOREIGN KEY FK_35DD63CEE8A7DCFA');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY FK_5A25B2DCA76ED395');
        $this->addSql('ALTER TABLE todo_list_task DROP FOREIGN KEY FK_5A25B2DCE8A7DCFA');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag DROP FOREIGN KEY FK_C9CCC2897F251143');
        $this->addSql('ALTER TABLE todo_list_task_todo_list_tag DROP FOREIGN KEY FK_C9CCC2894BC2E842');
        $this->addSql('DROP TABLE project');
        $this->addSql('DROP TABLE todo_list');
        $this->addSql('DROP TABLE todo_list_tag');
        $this->addSql('DROP TABLE todo_list_task');
        $this->addSql('DROP TABLE todo_list_task_todo_list_tag');
        $this->addSql('ALTER TABLE user_module DROP FOREIGN KEY FK_69763D15166D1F9C');
        $this->addSql('DROP INDEX IDX_69763D15166D1F9C ON user_module');
        $this->addSql('ALTER TABLE user_module DROP project_id, CHANGE updated_at updated_at DATETIME NOT NULL');
    }
}
