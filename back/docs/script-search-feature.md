# Script Search Feature (Backend)

Adds an optional `searchTerm` query parameter to `GET /api/scripts` that filters the paginated list by script title. Mirrors the pattern used by `PostRepository::getByProjectPaginatedAndSearchTerm`.

## Endpoint

`GET /api/scripts?projectUuid={uuid}&page={n}&limit={n}&status={status}&searchTerm={term}`

- All existing parameters are unchanged.
- `searchTerm` is **optional**. When present and non-empty, the list is filtered to scripts whose `title` matches `%searchTerm%` (case-insensitive).
- Empty / whitespace-only values are normalized to `null` in the DTO so they are treated as absent.

## Implementation

- [`ListScriptsQueryParamDTO`](../src/DTO/QueryParam/Script/ListScriptsQueryParamDTO.php) — new nullable `searchTerm` field, normalized in `fromQueryParams()` via `trim()` (empty string → `null`).
- [`ScriptRepository::getByProjectPaginated`](../src/Repository/ScriptRepository.php) — accepts an extra `?string $searchTerm`. When non-null:

  ```php
  $qb->andWhere('LOWER(s.title) LIKE LOWER(:searchTerm)')
      ->setParameter('searchTerm', '%' . $searchTerm . '%');
  ```

  Same shape as `PostRepository`'s search clause on `p.caption`.
- [`ScriptController::list`](../src/Controller/ScriptController.php) — forwards `$queryParamDto->getSearchTerm()` to the repository.

## Notes

- No schema change, no migration.
- Pagination still composes with the search filter: the LIKE clause is part of the same query that drives `setFirstResult` / `setMaxResults`.
- No new exception codes — `searchTerm` is optional and the LIKE pattern can't fail validation.
