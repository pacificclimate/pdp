###############################################
# Dockerfile to create an nginx reverse proxy #
# Based on Nginx official image		      #
###############################################

FROM nginx
MAINTAINER Carl Masri <cmasri@uvic.ca>

# Add configuration file
RUN rm -v /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/

EXPOSE 8080
