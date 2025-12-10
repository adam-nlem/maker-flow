<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251210173500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE todo_item (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, content LONGTEXT DEFAULT NULL, status VARCHAR(255) NOT NULL, priority VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, finished_at DATETIME DEFAULT NULL, due_date DATETIME DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_item_todo_item_category (todo_item_id INT NOT NULL, todo_item_category_id INT NOT NULL, INDEX IDX_2367AA6EC766982F (todo_item_id), INDEX IDX_2367AA6E29FB81F2 (todo_item_category_id), PRIMARY KEY (todo_item_id, todo_item_category_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE todo_item_category (id INT AUTO_INCREMENT NOT NULL, uuid CHAR(36) NOT NULL, title VARCHAR(255) NOT NULL, color VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE todo_item_todo_item_category ADD CONSTRAINT FK_2367AA6EC766982F FOREIGN KEY (todo_item_id) REFERENCES todo_item (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE todo_item_todo_item_category ADD CONSTRAINT FK_2367AA6E29FB81F2 FOREIGN KEY (todo_item_category_id) REFERENCES todo_item_category (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE todo_item_todo_item_category DROP FOREIGN KEY FK_2367AA6EC766982F');
        $this->addSql('ALTER TABLE todo_item_todo_item_category DROP FOREIGN KEY FK_2367AA6E29FB81F2');
        $this->addSql('DROP TABLE todo_item');
        $this->addSql('DROP TABLE todo_item_todo_item_category');
        $this->addSql('DROP TABLE todo_item_category');
    }
}
