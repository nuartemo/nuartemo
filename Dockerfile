FROM node:22-alpine AS frontend

WORKDIR /app
COPY frontend/chavenuarte/package.json frontend/chavenuarte/package-lock.json ./frontend/chavenuarte/
RUN npm --prefix frontend/chavenuarte ci --ignore-scripts
COPY frontend/chavenuarte ./frontend/chavenuarte
RUN npm --prefix frontend/chavenuarte run build:laravel

FROM php:8.5-apache AS runtime

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite headers \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

FROM runtime AS vendor

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-autoloader
COPY . .
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

FROM runtime

RUN sed -ri 's!DocumentRoot /var/www/html!DocumentRoot /var/www/html/public!' /etc/apache2/sites-available/*.conf \
    && printf 'ServerName localhost\n' > /etc/apache2/conf-available/servername.conf \
    && printf '<Directory "/var/www/html/public">\n    AllowOverride All\n    Require all granted\n</Directory>\nSetEnvIf X-Forwarded-Proto "^https$" HTTPS=on\nHeader always set Strict-Transport-Security "max-age=31536000" env=HTTPS\n' > /etc/apache2/conf-available/nuartemo.conf \
    && a2enconf servername nuartemo

WORKDIR /var/www/html
COPY --from=vendor /app /var/www/html
COPY --from=frontend /app/public/chavenuarte-v2/ /var/www/html/public/chavenuarte-v2/
COPY docker/entrypoint.sh /usr/local/bin/nuartemo-entrypoint

RUN chmod +x /usr/local/bin/nuartemo-entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

ENTRYPOINT ["nuartemo-entrypoint"]
CMD ["apache2-foreground"]
