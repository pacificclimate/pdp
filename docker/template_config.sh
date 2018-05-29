#!/bin/bash -e

j2 /templates/pdp_config.j2 > /root/pdp_config.yaml

exec "$@"
