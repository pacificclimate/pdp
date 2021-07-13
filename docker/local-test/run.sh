#!/bin/bash
# This script runs
docker run --rm -it \
  -e "DSN=postgresql://httpd_meta:XXXX@db3.pcic.uvic.ca:5432/pcic_meta_test" \
  -e "PCDS_DSN=postgresql://httpd:XXXX@db3.pcic.uvic.ca:5432/crmp" \
  -v $(pwd):/codebase \
  -v /storage/data:/storage/data:ro \
  --name pdp-test pcic/pdp-local-test
#  python -m pytest -v -m "not local_only" --tb=short tests -x

