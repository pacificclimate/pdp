###############################################
# Dockerfile to create an nginx reverse proxy #
# Based on Nginx official image		      #
###############################################

FROM nginx
MAINTAINER Carl Masri <cmasri@uvic.ca>

# Copy in template configuration
COPY nginx.template /etc/nginx/nginx.template

EXPOSE 8080

# Build the config file and start proxy
CMD ["/bin/bash", "-c", "envsubst '$$APP_HOST $$APP_PORT' < /etc/nginx/nginx.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
