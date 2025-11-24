#!/bin/bash
set -e

# Optionally, switch to the www-data user if needed:
# su-exec www-data bash -c "composer install ..."

echo "Running Composer install..."

if [ "$APP_ENV" = "dev" ]; then
    composer install
else
    composer install --no-dev --optimize-autoloader
fi

echo "Composer install completed."

# echo "Executing migrations..."
# php bin/console doctrine:migrations:migrate --no-interaction
# echo "Migrations executed."

# Execute the command passed to the container (the CMD from the Dockerfile)
exec "$@"