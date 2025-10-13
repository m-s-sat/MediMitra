FROM node:current-alpine3.22 AS backend
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5001
CMD [ "npm", "start" ]