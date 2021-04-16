# -------------------
# Build Stage 1 (npm)
# -------------------
FROM node:alpine AS appbuild

RUN apk add --update --no-cache \
            p7zip               \
            python2             \
            build-base          \
            curl                \
            php7                \
            php7-json           \
            php7-phar           \
            php7-iconv          \
            php7-openssl        \
            php7-dom            \
            php7-mbstring       \
            php7-xml            \
            php7-xmlwriter      \
            php7-ctype          \
            php7-tokenizer

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /usr/src/app

COPY ./package.json ./

COPY . ./

RUN npm install

# RUN npm run build:prod
RUN npm run build

# --------------------------
# Build Stage 2 (php-apache)
# This build takes the production build from staging builds
# --------------------------
FROM php:7.3-apache

ENV PROJECT /var/www/html

RUN apt-get update && apt-get install -y sqlite3 php7.3-sqlite
RUN a2enmod rewrite expires
# RUN docker-php-ext-install pdo_mysql

# RUN pecl install xdebug && docker-php-ext-enable xdebug
# COPY xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

WORKDIR $PROJECT
COPY --from=appbuild /usr/src/app/dist ./
RUN mkdir ./api/db && chown 33:33 ./api && chown 33:33 ./api/db && \
    mkdir ./api/logs && chown 33:33 ./api/logs

EXPOSE 80

VOLUME $PROJECT/api/db
