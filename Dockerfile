FROM nginx:alpine
COPY ./dist/PersonalQuiz /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]