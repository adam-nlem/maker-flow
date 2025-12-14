<?php

namespace App\DTO\QueryParam;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\Enum\ValidationExceptionType;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints as ORMAssert;

abstract class AbstractQueryParamDTO
{
    protected function __construct(
        protected RequestStack       $requestStack,
        protected ValidatorInterface $validator,
    ) {
        $queryParams = $this->requestStack->getCurrentRequest()->query->all();
        $this->fromQueryParams($queryParams);
    }

    abstract protected function fromQueryParams(array $queryParams): void;

    public function validate(): void
    {
        $errors = $this->validator->validate($this);
        if (count($errors) > 0) {
            foreach ($errors as $error) {
                switch ($error->getCode()) {
                    case ORMAssert\UniqueEntity::NOT_UNIQUE_ERROR:
                        throw new CustomValidationException(
                            ValidationExceptionType::AlreadyUsedValue,
                            $error->getPropertyPath()
                        );
                        break;
                }
            }
        }
    }
}
