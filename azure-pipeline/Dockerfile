FROM nginx:stable-alpine
COPY nginx.conf etc/nginx/conf.d/default.conf
WORKDIR /personalQuizApp 
COPY ./dist/PersonalQuiz .
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]