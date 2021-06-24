#!/usr/bin/env bash
set -o allexport; source ../../Compose/environment/security.env; set +o allexport

# dockerize -wait tcp://$DATABASE_HOST:$DATABASE_PORT  -wait tcp://$QUEUE_HOST:$QUEUE_PORT -timeout 30s

echo 'Initializing Database'

python3 manage.py makemigrations

python3 manage.py makemigrations_apps

python3 manage.py migrate

python3 manage.py loaddata_apps

python3 manage.py createsuperuser_default

python3 manage.py runserver 0.0.0.0:8080
