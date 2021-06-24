#!/usr/bin/env bash
dockerize -wait tcp://$QUEUE_HOST:$QUEUE_PORT -timeout 30s

echo "Running MQTT Transport Module."
python3 -u ./MQTT/mqtt_transport.py