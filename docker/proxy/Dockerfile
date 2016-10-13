###############################################
# Dockerfile to create an nginx reverse proxy #
# Based on Ubuntu:16.04			      #
###############################################

FROM ubuntu:16.04
MAINTAINER Carl Masri <cmasri@uvic.ca>

RUN apt-get update && apt-get install -y nginx

# Add configuration file
RUN rm -v /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
