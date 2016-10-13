#!/bin/bash -e

j2 /templates/pdp_config.j2 > /root/pdp_config.yaml
j2 /templates/supervisord.j2 > /etc/supervisord.conf

exec "$@"
