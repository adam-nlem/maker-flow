<?php

namespace App\DTO\Request;

use App\Exception\Validation\AlreadyUsedValueException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints as ORMAssert;

abstract class AbstractRequestDTO
{
    protected function __construct(
        protected RequestStack       $requestStack,
        protected ValidatorInterface $validator,
        protected ?array             $payload = null,
    ) {
        if (null === $payload) {
            $this->payload = json_decode($this->requestStack->getCurrentRequest()->getContent(), true);
        }

        $this->fromPayload($this->payload);
    }

    /**
     * Allows to manipulate and set the values from the payload to this object properties
     * @param array $payload
     * @return mixed
     */
    abstract protected function fromPayload(array $payload);

    /**
     * Validates the data and then calls buildObject method
     * @return mixed
     */
    public function build()
    {
        $errors = $this->validator->validate($this);
        if (count($errors) > 0) {
            foreach ($errors as $error) {
                switch ($error->getCode()) {
                    case ORMAssert\UniqueEntity::NOT_UNIQUE_ERROR:
                        throw new AlreadyUsedValueException($error->getPropertyPath());
                        break;
                }
            }
        } else {
            //? Here i need to make sure the object is valid
            // Allows me to send a custom error message and having custom assertion (not just sql exceptions)
            //TODO: Review if this is the best way to do it
            $object = $this->buildObject();
            $errors = $this->validator->validate($object);
            if (count($errors) > 0) {
                foreach ($errors as $error) {
                    switch ($error->getCode()) {
                        case ORMAssert\UniqueEntity::NOT_UNIQUE_ERROR:
                            throw new AlreadyUsedValueException($error->getPropertyPath());
                            break;
                    }
                }
            }

            return $this->buildObject();
        }
    }

    /**
     * Builds the value to be extracted from this DTO (could be an entity or any data)
     * @return mixed
     */
    abstract protected function buildObject(): mixed;
}
