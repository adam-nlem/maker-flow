<?php

namespace App\Maker;

use Symfony\Bundle\MakerBundle\ConsoleStyle;
use Symfony\Bundle\MakerBundle\DependencyBuilder;
use Symfony\Bundle\MakerBundle\Generator;
use Symfony\Bundle\MakerBundle\InputConfiguration;
use Symfony\Bundle\MakerBundle\Maker\AbstractMaker;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;

class MakeModule extends AbstractMaker
{
    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly ParameterBagInterface $params,
    ) {}

    public static function getCommandName(): string
    {
        return 'make:module';
    }

    public static function getCommandDescription(): string
    {
        return 'Generates the required structure for a new module (controllers, entities, services...)';
    }

    public function configureCommand(Command $command, InputConfiguration $inputConfig): void
    {
        $command
            ->addArgument(
                'name',
                InputArgument::REQUIRED,
                'Module name (ex: TodoList, Github, YoutubeStudio)'
            )
            ->addOption(
                'entities',
                null,
                InputOption::VALUE_OPTIONAL,
                'Comma-separated list of entities (ex: Item,Project,Label)'
            );
    }

    public function generate(InputInterface $input, ConsoleStyle $io, Generator $generator): void
    {
        $moduleName = $input->getArgument('name');
        $moduleNameSnake = $this->toSnakeCase($moduleName);
        $moduleNameDash  = $this->toDashCase($moduleName);

        $entitiesOption = $input->getOption('entities');
        $entities = $entitiesOption
            ? array_map('trim', explode(',', $entitiesOption))
            : [];

        $io->title(sprintf('Creating module "%s"', $moduleName));

        // 1. Update enum
        $this->updateModuleIdentifierEnum($io, $moduleName, $moduleNameSnake);

        // 2. Backend structure
        $this->generateBackendFiles(
            $generator,
            $moduleName,
            $moduleNameSnake,
            $moduleNameDash,
            $entities
        );

        $generator->writeChanges();

        $io->success(sprintf('Module "%s" created successfully! 🚀', $moduleName));
    }

    /**
     * Update Enum ModuleIdentifier.php
     */
    private function updateModuleIdentifierEnum(ConsoleStyle $io, string $moduleName, string $moduleNameSnake): void
    {
        $rootDir = $this->params->get('kernel.project_dir');
        $enumPath = $rootDir . '/src/Entity/Enum/ModuleIdentifier.php';

        if (!$this->filesystem->exists($enumPath)) {
            throw new \RuntimeException("Enum ModuleIdentifier.php not found");
        }

        $content = file_get_contents($enumPath);

        if (
            str_contains($content, "case $moduleName ") ||
            str_contains($content, "'$moduleNameSnake'")
        ) {
            throw new \RuntimeException("Module name or enum value already exists");
        }

        $caseLine = sprintf("    case %s = '%s';", $moduleName, $moduleNameSnake);

        $newContent = preg_replace(
            '/}\s*$/',
            $caseLine . PHP_EOL . "}" . PHP_EOL,
            $content
        );

        file_put_contents($enumPath, $newContent);
        $io->text("➕ Added enum case: $caseLine");
    }

    /**
     * Generate module structure
     */
    private function generateBackendFiles(
        Generator $generator,
        string $moduleName,
        string $moduleNameSnake,
        string $moduleNameDash,
        array $entities
    ): void {

        $root = $this->params->get('kernel.project_dir');
        $baseNamespace = "App\\Module\\$moduleName";

        // Create folders
        foreach (['Controller', 'Entity', 'Service', 'Repository', 'DTO'] as $dir) {
            $path = "$root/src/Module/$moduleName/$dir";
            if (!$this->filesystem->exists($path)) {
                $this->filesystem->mkdir($path, 0777);
            }
        }

        // Templates
        $controllerTpl = "$root/src/Maker/skeleton/ModuleController.tpl.php";
        $serviceTpl    = "$root/src/Maker/skeleton/ModuleService.tpl.php";
        $entityTpl     = "$root/src/Maker/skeleton/ModuleEntity.tpl.php";
        $repositoryTpl     = "$root/src/Maker/skeleton/ModuleRepository.tpl.php";

        // Generate controllers/services/entities for each entity
        foreach ($entities as $entity) {

            $controllerClass  = "$baseNamespace\\Controller\\{$moduleName}{$entity}Controller";
            $serviceClass     = "$baseNamespace\\Service\\{$moduleName}{$entity}Service";
            $entityClass      = "$baseNamespace\\Entity\\{$moduleName}{$entity}";
            $repositoryClass      = "$baseNamespace\\Repository\\{$moduleName}{$entity}Repository";

            // Controller
            $generator->generateClass(
                $controllerClass,
                $controllerTpl,
                [
                    'namespace'        => "$baseNamespace\\Controller",
                    'entity'           => $entity,
                    'entitySnake'      => $this->toSnakeCase($entity),
                    'entitySnakePlural'=> $this->toSnakeCase($entity) . 's',
                    'entityKebab'      => $this->toDashCase($entity),
                    'entityKebabPlural'=> $this->toDashCase($entity) . 's',
                    'entityCamel'      => lcfirst($entity),
                    'moduleName'       => $moduleName,
                    'moduleNameSnake'  => $moduleNameSnake,
                    'moduleNameDash'   => $moduleNameDash,
                ]
            );

            // Service
            $generator->generateClass(
                $serviceClass,
                $serviceTpl,
                [
                    'namespace'       => "$baseNamespace\\Service",
                    'entity'          => $entity,
                    'moduleName'      => $moduleName,
                ]
            );

            // Entity
            $generator->generateClass(
                $entityClass,
                $entityTpl,
                [
                    'namespace'       => "$baseNamespace\\Entity",
                    'moduleName'      => $moduleName,
                    'entity'          => $entity,
                    'tableName'       => strtolower($moduleNameSnake . '_' . $this->toSnakeCase($entity)),
                ]
            );

            // Repository
            $generator->generateClass(
                $repositoryClass,
                $repositoryTpl,
                [
                    'namespace'  => "$baseNamespace\\Repository",
                    'moduleName' => $moduleName,
                    'entity'     => $entity,
                ]
            );
        }
    }

    /**
     * Utility: PascalCase -> snake_case
     */
    private function toSnakeCase(string $name): string
    {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $name));
    }

    /**
     * Utility: PascalCase -> kebab-case
     */
    private function toDashCase(string $name): string
    {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $name));
    }

    public function configureDependencies(DependencyBuilder $dependencies): void {}
}
