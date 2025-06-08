FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=listings_bookings
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password

COPY ./init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
