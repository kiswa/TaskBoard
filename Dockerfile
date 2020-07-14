# -------------------
# Build Stage 1 (npm)
# -------------------
FROM node:alpine AS appbuild

RUN apk add --update --no-cache p7zip

WORKDIR /usr/src/app

COPY ./package.json ./
RUN npm install

COPY . ./
RUN npm run build:prod
# RUN npm run build


# ------------------------
# Build Stage 2 (composer)
# ------------------------
FROM composer AS apibuild

WORKDIR /app

COPY ./src/api ./
RUN composer install


# --------------------------
# Build Stage 3 (php-apache)
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
RUN rm -rf ./api/*
COPY --from=apibuild /app ./api/
RUN chmod 777 ./api
EXPOSE 80
