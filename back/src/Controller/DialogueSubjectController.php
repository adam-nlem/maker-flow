<?php

namespace App\Controller;

use App\DTO\QueryParam\DialogueSubject\ListDialogueSubjectsQueryParamDTO;
use App\DTO\Request\DialogueSubject\CreateDialogueSubjectRequestDTO;
use App\DTO\Request\DialogueSubject\ReorderDialogueSubjectsRequestDTO;
use App\DTO\Request\DialogueSubject\UpdateDialogueSubjectRequestDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\DialogueSubject;
use App\Entity\User;
use App\Repository\DialogueSubjectRepository;
use App\Repository\ScriptDialogueRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts/dialogue-subjects', requirements: ['dialogueSubjectUuid' => Requirement::UUID])]
final class DialogueSubjectController extends AbstractController
{
    #[Route('', name: 'api_scripts_dialogue_subjects_list', methods: ['GET'])]
    public function list(
        ListDialogueSubjectsQueryParamDTO $queryParamDto,
        ScriptDialogueRepository $dialogueRepository,
        DialogueSubjectRepository $subjectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $dialogue = $dialogueRepository->getByUuidAndUser($queryParamDto->getScriptDialogueUuid(), $user);

        if ($dialogue === null) {
            return $this->json(data: ["message" => "You don't have any dialogue with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $subjects = $subjectRepository->getByScriptDialogueAndUserOrderedByPosition($dialogue, $user);

        return $this->json(
            data: $subjects,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_dialogue_subjects_list']]
        );
    }

    #[Route('', name: 'api_scripts_dialogue_subjects_create', methods: ['POST'])]
    public function create(
        CreateDialogueSubjectRequestDTO $dto,
        ScriptDialogueRepository $dialogueRepository,
        DialogueSubjectRepository $subjectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $dialogue = $dialogueRepository->getByUuidAndUser($dto->getScriptDialogueUuid(), $user);

        if ($dialogue === null) {
            return $this->json(data: ["message" => "You don't have any dialogue with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var DialogueSubject $subject */
            $subject = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $subject
            ->setUser($user)
            ->setScriptDialogue($dialogue);

        if ($dto->getPosition() !== null) {
            $subject->setPosition($dto->getPosition());
        } else {
            $maxPosition = $subjectRepository->getMaxPositionByScriptDialogue($dialogue);
            $subject->setPosition($maxPosition + 1);
        }

        $subjectRepository->save($subject, true);

        return $this->json(
            data: $subject,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_dialogue_subjects_create']]
        );
    }

    #[Route('/{dialogueSubjectUuid}', name: 'api_scripts_dialogue_subjects_update', methods: ['PATCH'])]
    public function update(
        string $dialogueSubjectUuid,
        UpdateDialogueSubjectRequestDTO $dto,
        DialogueSubjectRepository $subjectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $subject = $subjectRepository->getByUuidAndUser($dialogueSubjectUuid, $user);

        if ($subject === null) {
            return $this->json(data: ["message" => "You don't have any dialogue subject with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getSpeaker() !== null && $dto->getSpeaker() !== $subject->getSpeaker()) {
            $subject->setSpeaker($dto->getSpeaker());
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $subject->getContent()) {
            $subject->setContent($dto->getContent());
        }

        $subjectRepository->save($subject, true);

        return $this->json(
            data: $subject,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_dialogue_subjects_update']]
        );
    }

    #[Route('/{dialogueSubjectUuid}', name: 'api_scripts_dialogue_subjects_delete', methods: ['DELETE'])]
    public function delete(string $dialogueSubjectUuid, DialogueSubjectRepository $subjectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $subject = $subjectRepository->getByUuidAndUser($dialogueSubjectUuid, $user);

        if ($subject === null) {
            return $this->json(data: ["message" => "You don't have any dialogue subject with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $subjectRepository->remove($subject, true);

        return $this->json(data: ["message" => "Dialogue subject deleted successfully"], status: Response::HTTP_OK);
    }

    #[Route('/reorder', name: 'api_scripts_dialogue_subjects_reorder', methods: ['PATCH'])]
    public function reorder(
        ReorderDialogueSubjectsRequestDTO $dto,
        ScriptDialogueRepository $dialogueRepository,
        DialogueSubjectRepository $subjectRepository,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $dialogue = $dialogueRepository->getByUuidAndUser($dto->getScriptDialogueUuid(), $user);

        if ($dialogue === null) {
            return $this->json(data: ["message" => "You don't have any dialogue with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        foreach ($dto->getOrderedUuids() as $index => $subjectUuid) {
            $subject = $subjectRepository->getByUuidAndUser($subjectUuid, $user);
            if ($subject !== null) {
                $subject->setPosition($index);
                $subjectRepository->save($subject);
            }
        }

        $entityManager->flush();

        return $this->json(data: ["message" => "Dialogue subjects reordered successfully"], status: Response::HTTP_OK);
    }
}
