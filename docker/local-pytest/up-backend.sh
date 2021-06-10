docker run -it \
  -e "APP_ROOT=http://0.0.0.0:30555" \
  -e "DATA_ROOT=http://0.0.0.0:30556" \
  -e "DSN=postgresql://httpd_meta@db3.pcic.uvic.ca:5432/pcic_meta" \
  -e "PCDS_DSN=postgresql://httpd@db3.pcic.uvic.ca:5432/crmp" \
  -e "GEOSERVER_URL=https://tools.pacificclimate.org/geoserver/" \
  -e "NCWMS_URL=http://docker-dev01.pcic.uvic.ca:30523/dynamic/x" \
  -e "TILECACHE_URL=https://a.tile.pacificclimate.org/tilecache/tilecache.py https://b.tile.pacificclimate.org/tilecache/tilecache.py https://c.tile.pacificclimate.org/tilecache/tilecache.py" \
  -e "USE_AUTH=False" \
  -e "SESSION_DIR=default" \
  -e "CLEAN_SESSION_DIR=True" \
  -e "USE_ANALYTICS=True" \
  -e "ANALYTICS=UA-20166041-2" \
  -e "GUNICORN_BIND=0.0.0.0:8000" \
  -e "GUNICORN_WORKER_CLASS=gevent" \
  -e "GUNICORN_WORKERS=10" \
  -e "GUNICORN_PROXY_PROTOCOL=True" \
  -e "GUNICORN_TIMEOUT=86400" \
  -e "APP_MODULE=pdp.wsgi:backend" \
  -v $(pwd):/codebase \
  -v /storage/data:/storage/data:ro \
  --name pdp-local-pytest_backend \
  pdp-local-pytest