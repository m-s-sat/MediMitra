FROM node:current-alpine3.22 AS frontend
WORKDIR /app
RUN apk add --no-cache git
COPY . .
RUN npm install && npm run build

FROM node:current-alpine3.22 AS backend
WORKDIR /app
COPY ./Backend ./Backend
COPY --from=frontend /app/dist ./Backend/dist
WORKDIR /app/Backend
RUN npm install
EXPOSE 5001
CMD ["npm", "start"]
