FROM node:current-alpine3.22 AS frnotend
WORKDIR /app
COPY ./client .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=frnotend /app/dist /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]