<?php

namespace App\DTO\Request\Agency;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Agency;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateAgencyRequestDTO extends AbstractRequestDTO
{
    private string $name;
    private File $logo;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {

        parent::__construct(
            $requestStack,
            $validator,
            $requestStack->getCurrentRequest()->request->all(),
        );
    }

    protected function fromPayload(array $payload)
    {
        $this->name = $payload['name'];
        $this->logo  = $this->requestStack->getCurrentRequest()->files->get('logo');
    }

    protected function buildObject(): Agency
    {
        $agency = new Agency();
        $agency->setName($this->getName());

        return $agency;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getLogo(): File
    {
        return $this->logo;
    }
}
