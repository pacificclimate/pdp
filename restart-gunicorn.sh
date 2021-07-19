#!/bin/bash
# This script can be executed (usually inside a container) to restart all Gunicorn
# processes gracefully. Courtesy of https://stackoverflow.com/a/60833629
kill -HUP `ps -C gunicorn fch -o pid | head -n 1`