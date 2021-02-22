FROM node:12.2.0 as stage
ENV NODE_OPTIONS=--max-old-space-size=4096
WORKDIR /app
COPY package*.json /app/
COPY .htaccess /app/
RUN npm install -g @angular/cli@8.3.29
RUN npm install
ENV NODE_OPTIONS=--max-old-space-size=2048
COPY ./ /app/
#RUN npm run build 
RUN ng build --prod 
#RUN npm run build-prod
#RUN ls -la /app/dist/ 
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
#FROM httpd:alpine
FROM php:7.1-apache
RUN apt-get update && \
    apt-get install -y \
        zlib1g-dev
RUN mkdir -p /etc/apache2/ssl
RUN ls -la  /etc/apache2/ssl
COPY --from=0  /app/dist/Angular/ /var/www/html/
COPY --from=0  /app/.htaccess /var/www/html/
COPY app-fe.conf /etc/apache2/sites-enabled/app-fe.conf
RUN a2dissite 000-default.conf
RUN a2enmod rewrite
RUN a2enmod ssl
RUN a2enmod headers
EXPOSE 443
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
