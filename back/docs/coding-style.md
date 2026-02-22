# Coding Style Guidelines - Backend (Symfony/PHP)

## Overview

This document describes the coding conventions, patterns, and best practices used in the MakerFlow backend application built with Symfony and PHP.

---

## Project Structure

```
back/src/
├── Command/             # CLI commands
├── Controller/          # API Controllers
├── DTO/                 # Data Transfer Objects
│   ├── External/        # External API response DTOs
│   │   └── [Platform]/  # Platform-specific (Instagram, YouTube, etc.)
│   ├── QueryParam/      # Query parameter DTOs
│   ├── Request/         # Request body DTOs
│   └── Response/        # Response DTOs
├── Entity/              # Doctrine entities
│   └── Enum/            # PHP enums
├── Event/               # Domain events
├── EventSubscriber/     # Event subscribers
├── Helper/              # Static helper classes
├── Message/             # Async messages
│   └── Handler/         # Message handlers
├── Repository/          # Doctrine repositories
├── Security/            # Authentication/Authorization
└── Service/             # Business logic services
```

---

## Naming Conventions

### Files & Classes

| Type | Convention | Example |
|------|------------|---------|
| Controller | `{Resource}Controller` | `ProjectController`, `UserController`, `PostController` |
| Entity | Singular noun | `Project`, `User`, `TodoList`, `Post`, `PostInsight` |
| Repository | `{Entity}Repository` | `ProjectRepository`, `PostRepository` |
| Service | `{Domain}Service` | `IntegrationInsightService`, `CookieService` |
| Request DTO | `{Action}{Resource}RequestDTO` | `CreateProjectRequestDTO`, `UpdateProjectRequestDTO` |
| Response DTO | `{Action}{Resource}ResponseDTO` | `AuthorizeInstagramIntegrationResponseDTO` |
| QueryParam DTO | `{Action}{Resource}QueryParamDTO` | `ListProjectsQueryParamDTO` |
| External DTO | `{Platform}{DataType}DTO` | `InstagramTokenDTO`, `InstagramUserProfileDTO` |
| Enum | Singular noun | `ProjectType`, `Color`, `TodoListStatus` |
| Helper | `{Domain}Helper` | `DateHelper`, `InsightEvolutionHelper` |
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
| Entity instances | camelCase singular | `$project`, `$user`, `$todoList`, `$post` |
| Collections | camelCase plural | `$projects`, `$users`, `$todoLists`, `$posts` |
| DTOs | `$dto` or `$queryParamDto` | `$dto`, `$queryParamDto` |
| UUIDs in routes | `{resource}Uuid` | `$projectUuid`, `$todoListUuid`, `$postUuid` |

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

### Route Examples

| Resource | Action | Route | Route Name |
|----------|--------|-------|------------|
| TodoList | list | `GET /api/todo-lists` | `api_todo_lists_list` |
| TodoList | create | `POST /api/todo-lists` | `api_todo_lists_create` |
| Post | list | `GET /api/posts` | `api_posts_list` |
| PostGroup | create | `POST /api/post-groups` | `api_post_groups_create` |
| IntegrationInsight | detail | `GET /api/integration-insights/detail` | `api_integration_insights_detail` |
| PostInsight | detail | `GET /api/post-insights/detail` | `api_post_insights_detail` |

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
9. **Orphan removal** for OneToMany collections

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
4. **Located in** `Entity/Enum/`

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

1. **Located in** `DTO/External/{Platform}/`
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

namespace App\Service;

class IntegrationInsightService
{
    public function __construct(
        private readonly IntegrationInsightRepository $insightRepository,
    ) {}

    public function fetchInstagramProfileInsights(Integration $integration): void
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
| `api_todo_lists_tasks_list` | List todo list tasks |
| `api_posts_list` | List posts |
| `api_post_insights_detail` | Post insight detail |

---

## Date Handling

1. **All dates stored in UTC** in the database
2. **Use `DateTimeImmutable`** for all date properties
3. **Use `DateHelper::createUtcDateTimeImmutable()`** for creating dates
4. **Timezone conversion** handled via `DateHelper` methods
5. **Client timezone** sent via `X-Timezone` header

---

## Redis Key Naming

### Convention

Redis keys follow the pattern: `{DOMAIN}/{SUBDOMAIN}/{TYPE}/{identifier}`

- **UPPERCASE** for static segments
- **Slash `/`** as separator
- **Dynamic values** at the end (lowercase)

### Examples

| Purpose | Key Pattern | Example |
|---------|-------------|---------|
| OAuth state | `INTEGRATION/{PLATFORM}/STATE/{state}` | `INTEGRATION/INSTAGRAM/STATE/abc123` |

### Key Generator Methods

Define static methods in `RedisStoreService` for key generation:

```php
public static function getIntegrationInstagramStateKey(string $state): string
{
    return sprintf('INTEGRATION/INSTAGRAM/STATE/%s', $state);
}

public static function getIntegrationTikTokStateKey(string $state): string
{
    return sprintf('INTEGRATION/TIKTOK/STATE/%s', $state);
}
```

### Conventions

1. **Static key methods** in `RedisStoreService`
2. **Method naming**: `get{Domain}{Subdomain}Key`
3. **Use `sprintf`** for key construction
4. **Document TTL** in comments where keys are used

---

## Grouped Response Pattern

When returning a list of items grouped by an enum (e.g., tasks by status, integrations by platform), use a dedicated Response DTO with `getData()` method.

### Response DTO Structure

```php
<?php

namespace App\DTO\Response\Integration;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Enum\IntegrationPlatform;
use Symfony\Component\Serializer\Attribute\Groups;

class ListIntegrationsGroupedByPlatformResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_integrations_list'])]
        private IntegrationPlatform $platform,
        /** @var Integration[] $integrations */
        #[Groups(['api_integrations_list'])]
        private array $integrations,
    ) {}

    public function getData(): array
    {
        return [
            'platform' => $this->getPlatform()->value,
            'integrations' => $this->getIntegrations(),
        ];
    }

    public function getPlatform(): IntegrationPlatform
    {
        return $this->platform;
    }

    public function getIntegrations(): array
    {
        return $this->integrations;
    }
}
```

### Controller Usage

```php
$platforms = IntegrationPlatform::cases();

$result = array_map(
    fn(IntegrationPlatform $platform) => (new ListIntegrationsGroupedByPlatformResponseDTO(
        $platform,
        $this->integrationRepository->getByProjectAndPlatform($project, $platform)
    ))->getData(),
    $platforms
);

return $this->json(
    data: $result,
    status: Response::HTTP_OK,
    context: ['groups' => ['api_integrations_list']]
);
```

### Conventions

1. **DTO naming**: `List{Resource}GroupedBy{Enum}ResponseDTO`
2. **Implement `ResponseDTOInterface`** with `getData()` method
3. **Use `array_map`** over enum cases to build grouped response
4. **Call `getData()`** on each DTO instance to get serializable array
5. **Enum value** returned as string via `->value`

---

## Pagination

### QueryParam DTO

Paginated endpoints use a QueryParam DTO with `page` and `limit` parameters:

```php
<?php

namespace App\DTO\QueryParam\Project;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListProjectsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->page = $queryParams["page"];
        $this->limit = $queryParams["limit"];
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }
}
```

### Repository Method

Repository methods for pagination follow this pattern:

```php
public function getByUserPaginated(User $user, int $page, int $limit): array
{
    return $this->createQueryBuilder('p')
        ->where('p.user = :user')
        ->setParameter('user', $user)
        ->setFirstResult(($page - 1) * $limit)
        ->setMaxResults($limit)
        ->orderBy('p.createdAt', 'DESC')
        ->getQuery()
        ->setHint(Query::HINT_INCLUDE_META_COLUMNS, true)
        ->getResult(Query::HYDRATE_SIMPLEOBJECT);
}
```

### Conventions

1. **Method naming**: `getBy{Criteria}Paginated`
2. **Parameters**: Always `int $page, int $limit` as the last parameters
3. **Offset calculation**: `($page - 1) * $limit`
4. **Default ordering**: By `createdAt DESC` unless otherwise specified
5. **Return type**: `array` (not paginator object)
6. **No metadata**: Response contains only the array of items (no total count, page info, etc.)

### Controller Usage

```php
#[Route('', name: 'api_projects_list', methods: ['GET'])]
public function list(ListProjectsQueryParamDTO $queryParamDto, ProjectRepository $projectRepository): JsonResponse
{
    /** @var User $user */
    $user = $this->getUser();

    $projects = $projectRepository->getByUserPaginated($user, $queryParamDto->getPage(), $queryParamDto->getLimit());

    return $this->json(data: $projects, status: Response::HTTP_OK, context: ['groups' => ['api_projects_get_paginated']]);
}
```

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
