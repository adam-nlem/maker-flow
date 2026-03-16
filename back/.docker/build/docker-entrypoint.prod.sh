#!/bin/bash
set -e

echo "Warming up Symfony cache..."
php bin/console cache:warmup --env=prod --no-debug

exec "$@"
