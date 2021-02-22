FROM node:12.2.0
RUN mkdir /opt/app-be
RUN mkdir /var/ssl
RUN mkdir /var/env
COPY ./at-length /usr/local/bin/
RUN chmod 755 /usr/local/bin/at-length
WORKDIR /opt/app-be
COPY . /opt/app-be
RUN ln -s /var/env/.env .env
RUN npm install
EXPOSE 443
CMD [ "npm", "run", "start:prod"] 
