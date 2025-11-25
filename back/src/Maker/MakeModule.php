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
        return 'Generates the required structure for a new module';
    }

    public function configureCommand(Command $command, InputConfiguration $inputConfig): void
    {
        $command
            ->addArgument(
                'name',
                InputArgument::REQUIRED,
                'Module\'s name (ex: Github, YoutubeStudio, SleepTracker)'
            );
    }

    public function generate(InputInterface $input, ConsoleStyle $io, Generator $generator): void
    {
        $moduleName = $input->getArgument('name');          // ex: "github_module" -> "GithubModule"
        $moduleNameSnake = $this->toSnakeCase($moduleName);   // ex: "GithubModule" -> "github_module"

        $io->title(sprintf('Creating the module "%s" (%s)', $moduleName, $moduleNameSnake));

        // 1. Update enum
        $this->updateModuleIdentifierEnum($io, $moduleName, $moduleNameSnake);

        // 2. Generate backend structure
        $this->generateBackendFiles($generator, $moduleName, $moduleNameSnake);

        $generator->writeChanges();

        $io->success(sprintf('Module "%s" created successfully ✅', $moduleName));
    }

    /**
     * Update App\Entity\Enum\ModuleIdentifier enum:
     * - check if case already exists
     * - append: "case {{ ModuleName }} = '{{ module_name_snake }}';"
     */
    private function updateModuleIdentifierEnum(ConsoleStyle $io, string $moduleName, string $moduleNameSnake): void
    {
        $rootDir = $this->params->get('kernel.project_dir');
        $enumPath = $rootDir . '/src/Entity/Enum/ModuleIdentifier.php';

        if (!$this->filesystem->exists($enumPath)) {
            $io->error('Enum file ModuleIdentifier not found : ' . $enumPath);
            throw new \RuntimeException('Enum ModuleIdentifier not found.');
        }

        $content = \file_get_contents($enumPath);
        if ($content === false) {
            $io->error('Unable to read ModuleIdentifier enum file.');
            throw new \RuntimeException('Cannot read ModuleIdentifier.');
        }

        // check if the case or value already exists
        if (
            str_contains($content, 'case ' . $moduleName . ' ')
            || str_contains($content, "'" . $moduleNameSnake . "'")
        ) {
            $io->error(sprintf(
                'The module name "%s" (or value "%s") is already taken in ModuleIdentifier.',
                $moduleName,
                $moduleNameSnake
            ));
            throw new \RuntimeException('Module name already taken.');
        }

        $caseLine = sprintf('    case %s = \'%s\';', $moduleName, $moduleNameSnake);

        // insert before closing brace of enum
        $newContent = \preg_replace(
            '/}\s*$/',
            "    " . $caseLine . PHP_EOL . "}" . PHP_EOL,
            $content,
            1,
            $count
        );

        if ($count === 0 || $newContent === null) {
            $io->error('Unable to insert new case into ModuleIdentifier enum file.');
            throw new \RuntimeException('Cannot update ModuleIdentifier.');
        }

        \file_put_contents($enumPath, $newContent);
        $io->text(sprintf('➕ Added in ModuleIdentifier : %s', $caseLine));
    }

    /**
     * Generate:
     * - src/Module/{{ModuleName}}/Controller/{{ModuleName}}ModuleController.php
     * - src/Module/{{ModuleName}}/Service/{{ModuleName}}ModuleService.php
     * - src/Module/{{ModuleName}}/Entity/ (empty dir)
     */
    private function generateBackendFiles(Generator $generator, string $moduleName, string $moduleNameSnake): void
    {
        $baseNamespace = 'App\\Module\\' . $moduleName;

        // Controller
        $controllerClassName = $baseNamespace . '\\Controller\\' . $moduleName . 'ModuleController';
        $generator->generateClass(
            $controllerClassName,
            'templates/maker/module/ModuleController.php.twig',
            [
                'moduleName' => $moduleName,
                'moduleNameSnake' => $moduleNameSnake,
            ]
        );

        // Service
        $serviceClassName = $baseNamespace . '\\Service\\' . $moduleName . 'ModuleService';
        $generator->generateClass(
            $serviceClassName,
            'templates/maker/module/ModuleService.php.twig',
            [
                'moduleName' => $moduleName,
                'moduleNameSnake' => $moduleNameSnake,
            ]
        );

        // Entity folder
        $rootDir = $this->params->get('kernel.project_dir');
        $entityDir = $rootDir . '/src/Module/' . $moduleName . '/Entity';

        if (!$this->filesystem->exists($entityDir)) {
            $this->filesystem->mkdir($entityDir, 0777);
        }
    }

    private function toSnakeCase(string $name): string
    {
        // transforms "GithubModule" into "github_module"
        $snake = \preg_replace('/(?<!^)[A-Z]/', '_$0', $name);

        return \strtolower($snake);
    }

    public function configureDependencies(DependencyBuilder $dependencies): void
    {
        // No extra dependencies required for now
    }
}
