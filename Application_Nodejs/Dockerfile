FROM node:bullseye-slim
ENTRYPOINT ["/bin/bash", "-c"]
WORKDIR /APP
COPY . .
RUN npm i  
CMD [ "cd /APP; node app.js" ]
