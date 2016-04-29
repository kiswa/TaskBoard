# Dockerfile for Taskboard with nginx and sqlite.

FROM ubuntu:trusty
MAINTAINER Alex van den Hoogen <alex.van.den.hoogen@geodan.nl>

RUN apt-get update && \
    apt-get install -yq --no-install-recommends git wget nginx php5-fpm php5-sqlite sqlite3 ca-certificates pwgen php5-cli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN echo "cgi.fix_pathinfo = 0;" >> /etc/php5/fpm/php.ini && \
    echo "daemon off;" >> /etc/nginx/nginx.conf && \
    mkdir -p /var/www

RUN git clone https://github.com/kiswa/TaskBoard.git /var/www && \
    chmod 777 $(find /var/www -type d)

RUN cd /var/www/ && ./build/composer.phar install

ADD nginx.conf /etc/nginx/sites-available/default

EXPOSE 80

CMD service php5-fpm start && nginx

