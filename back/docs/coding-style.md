# Coding Style Guidelines - Backend (Symfony/PHP)

## Overview

This document describes the coding conventions, patterns, and best practices used in the MakerFlow backend application built with Symfony and PHP.

---

## Project Structure

```
back/src/
├── Controller/          # API Controllers
├── DTO/                 # Data Transfer Objects
│   ├── External/        # External API response DTOs
│   │   └── [Provider]/  # Provider-specific (Instagram, TikTok, etc.)
│   ├── QueryParam/      # Query parameter DTOs
│   ├── Request/         # Request body DTOs
│   └── Response/        # Response DTOs
├── Entity/              # Doctrine entities
│   └── Enum/            # PHP enums
├── Helper/              # Static helper classes
├── Module/              # Feature modules (self-contained)
│   └── [ModuleName]/
│       ├── Controller/
│       ├── DTO/
│       ├── Entity/
│       ├── Repository/
│       └── Service/
├── Repository/          # Doctrine repositories
├── Security/            # Authentication/Authorization
└── Service/             # Business logic services
```

---

## Naming Conventions

### Files & Classes

| Type | Convention | Example |
|------|------------|---------|
| Controller | `{Resource}Controller` | `ProjectController`, `UserController` |
| Entity | Singular noun | `Project`, `User`, `TodoList` |
| Repository | `{Entity}Repository` | `ProjectRepository`, `UserRepository` |
| Service | `{Domain}Service` | `ModuleService`, `CookieService` |
| Request DTO | `{Action}{Resource}RequestDTO` | `CreateProjectRequestDTO`, `UpdateProjectRequestDTO` |
| Response DTO | `{Action}{Resource}ResponseDTO` | `AuthorizeInstagramIntegrationResponseDTO` |
| QueryParam DTO | `{Action}{Resource}QueryParamDTO` | `ListProjectsQueryParamDTO` |
| External DTO | `{Provider}{DataType}DTO` | `InstagramTokenDTO`, `InstagramUserProfileDTO` |
| Enum | Singular noun | `ProjectType`, `Color`, `TodoListStatus` |
| Helper | `{Domain}Helper` | `DateHelper` |
| Exception | `{Name}Exception` | `CustomValidationException`, `IconNotFoundException` |

### Methods

| Type | Convention | Example |
|------|------------|---------|
| Controller actions | Verb (REST-like) | `create`, `update`, `delete`, `list`, `show` |
| Repository getters | `getBy{Criteria}` | `getByUuidAndUser`, `getByNameAndUser` |
| Repository save/remove | `save`, `remove` | `save($entity, $flush)` |
| Setters | `set{Property}` | `setName`, `setDescription` |
| Getters | `get{Property}` | `getName`, `getDescription` |
| Boolean getters | `is{Property}` or `has{Property}` | `isFinished`, `hasAccess` |

### Variables

| Type | Convention | Example |
|------|------------|---------|
| Entity instances | camelCase singular | `$project`, `$user`, `$todoList` |
| Collections | camelCase plural | `$projects`, `$users`, `$todoLists` |
| DTOs | `$dto` or `$queryParamDto` | `$dto`, `$queryParamDto` |
| UUIDs in routes | `{resource}Uuid` | `$projectUuid`, `$todoListUuid` |

---

## Controllers

### Structure

```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/resource')]
final class ResourceController extends AbstractController
{
    #[Route('', name: 'api_resource_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        // ...
    }

    #[Route('', name: 'api_resource_create', methods: ['POST'])]
    public function create(): JsonResponse
    {
        // ...
    }

    #[Route('/{resourceUuid}', name: 'api_resource_show', methods: ['GET'])]
    public function show(string $resourceUuid): JsonResponse
    {
        // ...
    }

    #[Route('/{resourceUuid}', name: 'api_resource_update', methods: ['PATCH'])]
    public function update(string $resourceUuid): JsonResponse
    {
        // ...
    }

    #[Route('/{resourceUuid}', name: 'api_resource_delete', methods: ['DELETE'])]
    public function delete(string $resourceUuid): JsonResponse
    {
        // ...
    }
}
```

### Conventions

1. **Use `final` keyword** on controller classes
2. **Base route** defined at class level with `#[Route('/api/resource')]`
3. **Route names** follow pattern: `api_{resource}_{action}`
4. **HTTP methods** use REST conventions:
   - `GET` for read operations
   - `POST` for create operations
   - `PATCH` for partial updates
   - `DELETE` for deletions
5. **Type-hint User** with docblock when using `getUser()`:
   ```php
   /** @var User $user */
   $user = $this->getUser();
   ```
6. **Return JSON responses** with serialization groups:
   ```php
   return $this->json(
       data: $project,
       status: Response::HTTP_OK,
       context: ['groups' => ['api_project_create']]
   );
   ```
7. **Use named parameters** for `$this->json()` calls

### Error Handling

```php
if ($project === null) {
    return $this->json(
        data: ["message" => "You don't have any project with this uuid"],
        status: Response::HTTP_NOT_FOUND
    );
}
```

---

## Module Controllers

Module controllers follow the same conventions as regular controllers but with specific naming patterns for routes.

### Structure

```php
<?php

namespace App\Module\TodoList\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/todo-lists')]
class TodoListController extends AbstractController
{
    #[Route('', name: 'api_modules_todo_lists_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_todo_lists_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{todoListUuid}', name: 'api_modules_todo_lists_show', methods: ['GET'])]
    public function show(string $todoListUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{todoListUuid}', name: 'api_modules_todo_lists_update', methods: ['PATCH'])]
    public function update(string $todoListUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{todoListUuid}', name: 'api_modules_todo_lists_delete', methods: ['DELETE'])]
    public function delete(string $todoListUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
```

### Module Controller Conventions

1. **Base route** follows pattern: `/api/modules/{module-name}/{resource-plural}`
   - Example: `/api/modules/todo-lists`, `/api/modules/social-analytics/profiles`
2. **Route names** follow pattern: `api_modules_{module}_{resource_plural}_{action}`
   - Example: `api_modules_todo_lists_list`, `api_modules_social_analytics_profiles_create`
3. **No route name prefix** on class-level `#[Route]` attribute
4. **Full route names** on each method (not using prefix concatenation)
5. **UUID parameters** use resource name: `{resourceUuid}` (e.g., `{todoListUuid}`, `{profileUuid}`)
6. **Resource paths** use plural form with kebab-case (e.g., `todo-lists`, `post-groups`, `metric-logs`)

### Route Name Examples

| Module | Resource | Action | Route Name |
|--------|----------|--------|------------|
| TodoList | TodoList | list | `api_modules_todo_lists_list` |
| TodoList | TodoList | create | `api_modules_todo_lists_create` |
| TodoList | TodoListTask | list | `api_modules_todo_lists_tasks_list` |
| SocialAnalytics | Profile | list | `api_modules_social_analytics_profiles_list` |
| SocialAnalytics | PostGroup | create | `api_modules_social_analytics_post_groups_create` |

---

## Entities

### Structure

```php
<?php

namespace App\Entity;

use App\Helper\DateHelper;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ResourceRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Resource
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_resource_create', 'api_resource_list'])]
    private ?string $uuid = null;

    // ... other properties

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
    }

    // Getters and setters...
}
```

### Conventions

1. **Auto-generate UUID** in constructor using `Uuid::v4()`
2. **Auto-set createdAt** in constructor using `DateHelper::createUtcDateTimeImmutable()`
3. **Auto-update updatedAt** using `#[ORM\PreUpdate]` lifecycle callback
4. **Use `DateTimeImmutable`** for all date fields
5. **All dates stored in UTC**
6. **Serialization groups** defined on each property for API exposure
7. **Fluent setters** returning `static`:
   ```php
   public function setName(string $name): static
   {
       $this->name = $name;
       return $this;
   }
   ```
8. **Cascade delete** configured on relationships:
   ```php
   #[ORM\ManyToOne(inversedBy: 'projects')]
   #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
   private ?User $user = null;
   ```
9. **Orphan removal** for OneToMany collections:
   ```php
   #[ORM\OneToMany(targetEntity: UserModule::class, mappedBy: 'project', cascade: ['remove'], orphanRemoval: true)]
   private Collection $userModules;
   ```

---

## Enums

### Structure

```php
<?php

namespace App\Entity\Enum;

enum ProjectType: string
{
    case Saas = 'saas';
    case ContentCreation = 'content_creation';
    case MobileApp = 'mobile_app';
    // ...
}
```

### Conventions

1. **Backed enums** with `string` type for API serialization
2. **PascalCase** for case names
3. **snake_case** for string values
4. **Located in** `Entity/Enum/` or `Module/{Name}/Entity/Enum/`

---

## DTOs

### Request DTOs

```php
<?php

namespace App\DTO\Request\Project;

use App\DTO\Request\AbstractRequestDTO;

class CreateProjectRequestDTO extends AbstractRequestDTO
{
    private string $name;
    private ?string $description;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->name = $payload["name"];
        $this->description = $payload["description"] ?? null;
    }

    public function buildObject(): Entity
    {
        $entity = new Entity();
        return $entity
            ->setName($this->getName())
            ->setDescription($this->getDescription());
    }

    // Getters...
}
```

### QueryParam DTOs

```php
<?php

namespace App\DTO\QueryParam\Project;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\Validator\Constraints as Assert;

class ListProjectsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    protected function fromQueryParams(array $queryParams): void
    {
        $this->page = $queryParams["page"];
        $this->limit = $queryParams["limit"];
    }

    // Getters...
}
```

### Conventions

1. **Extend abstract base classes** (`AbstractRequestDTO`, `AbstractQueryParamDTO`)
2. **Use array bracket notation** for payload access: `$payload["name"]`
3. **Nullable properties** use `?` type hint
4. **Validation constraints** as PHP attributes
5. **`buildObject()`** returns the constructed entity or data

### External DTOs

External DTOs are used to type responses from third-party APIs (Instagram, TikTok, Stripe, etc.).

```php
<?php

namespace App\DTO\External\Instagram;

class InstagramTokenDTO
{
    public function __construct(
        private readonly string $accessToken,
        private readonly int $expiresIn,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            accessToken: $data['access_token'],
            expiresIn: $data['expires_in'] ?? 5184000,
        );
    }

    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function getExpiresIn(): int
    {
        return $this->expiresIn;
    }
}
```

### External DTO Conventions

1. **Located in** `DTO/External/{Provider}/`
2. **Immutable** - use `readonly` properties
3. **Factory method** `fromArray()` for creating from API response
4. **Default values** for optional fields in `fromArray()`
5. **No validation** - trust external API response structure
6. **Getters only** - no setters

---

## Repositories

### Structure

```php
<?php

namespace App\Repository;

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;

/**
 * @extends ServiceEntityRepository<Entity>
 */
class EntityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Entity::class);
    }

    public function save(Entity $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Entity $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function getByUuidAndUser(string $uuid, User $user): ?Entity
    {
        return $this->createQueryBuilder('e')
            ->where('e.uuid = :uuid')
            ->andWhere('e.user = :user')
            ->setParameter('uuid', $uuid)
            ->setParameter('user', $user)
            ->getQuery()
            ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
            ->getOneOrNullResult(Query::HYDRATE_SIMPLEOBJECT);
    }
}
```

### Conventions

1. **Standard `save` and `remove` methods** with optional `$flush` parameter
2. **Query builder alias** uses first letter(s) of entity: `'p'` for Project, `'tl'` for TodoList
3. **Use `Query::HYDRATE_SIMPLEOBJECT`** for better performance
4. **Use `Query::HINT_INCLUDE_META_COLUMNS`** to include metadata
5. **Return nullable** for single result queries: `?Entity`
6. **Return array** for collection queries

---

## Services

### Structure

```php
<?php

namespace App\Service\Module;

class ModuleService
{
    public function __construct(
        private readonly string $moduleIconPath,
    ) {}

    public function getModuleIcon(string $moduleIdentifier): File
    {
        // Business logic...
    }
}
```

### Conventions

1. **Constructor injection** for dependencies
2. **Use `readonly`** for injected dependencies
3. **Single responsibility** - one service per domain concern
4. **Throw custom exceptions** for error cases

---

## Helpers

### Structure

```php
<?php

namespace App\Helper;

class DateHelper
{
    const FORMAT_ISO8601_NO_TZ = 'Y-m-d\TH:i:s';

    public static function createUtcDateTimeImmutable(string $datetime = 'now'): \DateTimeImmutable
    {
        return new \DateTimeImmutable($datetime, new \DateTimeZone('UTC'));
    }
}
```

### Conventions

1. **Static methods only**
2. **No state** - pure utility functions
3. **Constants** for reusable values
4. **Document methods** with PHPDoc

---

## Modules

Modules are self-contained feature packages with their own controllers, entities, DTOs, repositories, and services.

### Structure

```
Module/
└── TodoList/
    ├── Controller/
    │   ├── TodoListController.php
    │   └── TodoListTaskController.php
    ├── DTO/
    │   ├── QueryParam/
    │   └── Request/
    ├── Entity/
    │   ├── Enum/
    │   ├── TodoList.php
    │   └── TodoListTask.php
    ├── Repository/
    └── Service/
```

### Conventions

1. **Route prefix** includes module: `/api/modules/todo-lists`
2. **Namespace** follows structure: `App\Module\TodoList\Controller`
3. **Can reference core entities** (User, UserModule, Project)
4. **Self-contained** - all module-specific code in module folder

---

## API Response Patterns

### Success Responses

```php
// Single entity
return $this->json(
    data: $project,
    status: Response::HTTP_OK,
    context: ['groups' => ['api_project_create']]
);

// Collection
return $this->json(
    data: $projects,
    status: Response::HTTP_OK,
    context: ['groups' => ['api_projects_get_paginated']]
);

// Success message
return $this->json(
    data: ["message" => "Project deleted successfully"],
    status: Response::HTTP_OK
);
```

### Error Responses

```php
// Not found
return $this->json(
    data: ["message" => "You don't have any project with this uuid"],
    status: Response::HTTP_NOT_FOUND
);

// Conflict
return $this->json(
    data: ["Message" => "You already use this name for another project"],
    status: Response::HTTP_CONFLICT
);

// Not modified
return $this->json(
    data: ["message" => "This project has already been finished"],
    status: Response::HTTP_NOT_MODIFIED
);
```

---

## Serialization Groups

### Naming Convention

```
api_{resource}_{action}
```

### Examples

| Group | Usage |
|-------|-------|
| `api_project_create` | Create project response |
| `api_project_update` | Update project response |
| `api_projects_get_paginated` | List projects response |
| `api_project_get_by_uuid` | Get single project response |
| `api_modules_todo_lists_tasks_list` | List todo list tasks |

---

## Date Handling

1. **All dates stored in UTC** in the database
2. **Use `DateTimeImmutable`** for all date properties
3. **Use `DateHelper::createUtcDateTimeImmutable()`** for creating dates
4. **Timezone conversion** handled via `DateHelper` methods
5. **Client timezone** sent via `X-Timezone` header

---

## Best Practices

1. **Always validate user ownership** before operations
2. **Use DTOs** for request/response data transformation
3. **Keep controllers thin** - business logic in services
4. **Use serialization groups** to control API output
5. **Cascade deletes** configured at entity level
6. **UUID for public identifiers**, auto-increment ID for internal use
7. **Named parameters** in function calls for clarity
8. **Type hints** on all method parameters and return types
