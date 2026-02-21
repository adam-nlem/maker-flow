<?php

namespace App\Controller;

use App\DTO\QueryParam\Script\ListScriptsQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\Script\CreateScriptRequestDTO;
use App\DTO\Request\Script\ReorderScriptPartsRequestDTO;
use App\DTO\Request\Script\UpdateScriptRequestDTO;
use App\Entity\Enum\ScriptPartType;
use App\Entity\Script;
use App\Entity\User;
use App\Repository\HookTemplateRepository;
use App\Repository\PostGroupRepository;
use App\Repository\ProjectRepository;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTagRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVoiceOverRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts', requirements: ['scriptUuid' => Requirement::UUID])]
final class ScriptController extends AbstractController
{
    #[Route('', name: 'api_scripts_list', methods: ['GET'])]
    public function list(
        ListScriptsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $scripts = $scriptRepository->getByProjectAndUser($project, $user);

        return $this->json(
            data: $scripts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_list']]
        );
    }

    #[Route('', name: 'api_scripts_create', methods: ['POST'])]
    public function create(
        CreateScriptRequestDTO $dto,
        ProjectRepository $projectRepository,
        ScriptRepository $scriptRepository,
        PostGroupRepository $postGroupRepository,
        HookTemplateRepository $hookTemplateRepository,
        ScriptTagRepository $scriptTagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var Script $script */
            $script = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $script
            ->setUser($user)
            ->setProject($project);

        if ($dto->getPostGroupUuid() !== null) {
            $postGroup = $postGroupRepository->getByUuidAndUser($dto->getPostGroupUuid(), $user);
            if ($postGroup !== null) {
                $script->setPostGroup($postGroup);
            }
        }

        if ($dto->getHookTemplateUuid() !== null) {
            $hookTemplate = $hookTemplateRepository->getByUuid($dto->getHookTemplateUuid());
            if ($hookTemplate !== null) {
                $script->setHookTemplate($hookTemplate);
            }
        }

        if ($dto->getTagUuids() !== null && count($dto->getTagUuids()) > 0) {
            $tags = $scriptTagRepository->getByUserAndWithUuidIn($user, $dto->getTagUuids());
            foreach ($tags as $tag) {
                $script->addTag($tag);
            }
        }

        $scriptRepository->save($script, true);

        return $this->json(
            data: $script,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_create']]
        );
    }

    #[Route('/{scriptUuid}', name: 'api_scripts_show', methods: ['GET'])]
    public function show(
        string $scriptUuid,
        ScriptRepository $scriptRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            data: $script,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_show']]
        );
    }

    #[Route('/{scriptUuid}', name: 'api_scripts_update', methods: ['PATCH'])]
    public function update(
        string $scriptUuid,
        UpdateScriptRequestDTO $dto,
        ScriptRepository $scriptRepository,
        PostGroupRepository $postGroupRepository,
        HookTemplateRepository $hookTemplateRepository,
        ScriptTagRepository $scriptTagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $script->getTitle()) {
            $script->setTitle($dto->getTitle());
        }

        if ($dto->getHook() !== null) {
            $script->setHook($dto->getHook());
        }

        if ($dto->getPublishedAt() !== null) {
            $script->setPublishedAt(new \DateTimeImmutable($dto->getPublishedAt()));
        }

        if ($dto->hasPostGroupUuid()) {
            if ($dto->getPostGroupUuid() === null) {
                $script->setPostGroup(null);
            } else {
                $postGroup = $postGroupRepository->getByUuidAndUser($dto->getPostGroupUuid(), $user);
                if ($postGroup !== null) {
                    $script->setPostGroup($postGroup);
                }
            }
        }

        if ($dto->hasHookTemplateUuid()) {
            if ($dto->getHookTemplateUuid() === null) {
                $script->setHookTemplate(null);
            } else {
                $hookTemplate = $hookTemplateRepository->getByUuid($dto->getHookTemplateUuid());
                if ($hookTemplate !== null) {
                    $script->setHookTemplate($hookTemplate);
                }
            }
        }

        if ($dto->getTagUuids() !== null) {
            foreach ($script->getTags()->toArray() as $existingTag) {
                $script->removeTag($existingTag);
            }

            if (count($dto->getTagUuids()) > 0) {
                $tags = $scriptTagRepository->getByUserAndWithUuidIn($user, $dto->getTagUuids());
                foreach ($tags as $tag) {
                    $script->addTag($tag);
                }
            }
        }

        $scriptRepository->save($script, true);

        return $this->json(
            data: $script,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_update']]
        );
    }

    #[Route('/{scriptUuid}', name: 'api_scripts_delete', methods: ['DELETE'])]
    public function delete(
        string $scriptUuid,
        ScriptRepository $scriptRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $scriptRepository->remove($script, true);

        return $this->json(data: ["message" => "Script deleted successfully"], status: Response::HTTP_OK);
    }

    #[Route('/{scriptUuid}/parts', name: 'api_scripts_parts_list', methods: ['GET'])]
    public function listParts(
        string $scriptUuid,
        ScriptRepository $scriptRepository,
        ScriptChapterRepository $chapterRepository,
        ScriptVoiceOverRepository $voiceOverRepository,
        ScriptDialogueRepository $dialogueRepository,
        ScriptShotRepository $shotRepository,
        ScriptTextRepository $textRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $chapters = $chapterRepository->getByScriptAndUserOrderedByPosition($script, $user);
        $voiceOvers = $voiceOverRepository->getByScriptAndUserOrderedByPosition($script, $user);
        $dialogues = $dialogueRepository->getByScriptAndUserOrderedByPosition($script, $user);
        $shots = $shotRepository->getByScriptAndUserOrderedByPosition($script, $user);
        $texts = $textRepository->getByScriptAndUserOrderedByPosition($script, $user);

        $allParts = array_merge($chapters, $voiceOvers, $dialogues, $shots, $texts);

        usort($allParts, fn($a, $b) => $a->getPosition() <=> $b->getPosition());

        return $this->json(
            data: $allParts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_parts_list']]
        );
    }

    #[Route('/{scriptUuid}/reorder-parts', name: 'api_scripts_parts_reorder', methods: ['PATCH'])]
    public function reorderParts(
        string $scriptUuid,
        ReorderScriptPartsRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptChapterRepository $chapterRepository,
        ScriptVoiceOverRepository $voiceOverRepository,
        ScriptDialogueRepository $dialogueRepository,
        ScriptShotRepository $shotRepository,
        ScriptTextRepository $textRepository,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($scriptUuid, $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        foreach ($dto->getOrderedParts() as $index => $part) {
            $partUuid = $part["uuid"];
            $partType = ScriptPartType::tryFrom($part["type"]);

            $entity = match ($partType) {
                ScriptPartType::Chapter => $chapterRepository->getByUuidAndUser($partUuid, $user),
                ScriptPartType::VoiceOver => $voiceOverRepository->getByUuidAndUser($partUuid, $user),
                ScriptPartType::Dialogue => $dialogueRepository->getByUuidAndUser($partUuid, $user),
                ScriptPartType::Shot => $shotRepository->getByUuidAndUser($partUuid, $user),
                ScriptPartType::Text => $textRepository->getByUuidAndUser($partUuid, $user),
                default => null,
            };

            if ($entity !== null) {
                $entity->setPosition($index);

                match ($partType) {
                    ScriptPartType::Chapter => $chapterRepository->save($entity),
                    ScriptPartType::VoiceOver => $voiceOverRepository->save($entity),
                    ScriptPartType::Dialogue => $dialogueRepository->save($entity),
                    ScriptPartType::Shot => $shotRepository->save($entity),
                    ScriptPartType::Text => $textRepository->save($entity),
                    default => null,
                };
            }
        }

        $entityManager->flush();

        return $this->json(data: ["message" => "Parts reordered successfully"], status: Response::HTTP_OK);
    }
}
