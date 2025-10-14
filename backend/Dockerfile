FROM node:current-alpine3.22 AS backend
WORKDIR /app
COPY ./backend .
RUN npm install
EXPOSE 5000
CMD [ "npm", "start" ]