FROM alpine:3.8
LABEL maintainer "Alexander Pehm <alexander@alexanderpehm.at>"

RUN apk add --no-cache nodejs npm

COPY . ./
RUN npm install && npm run build
RUN cd server && npm install
WORKDIR server
EXPOSE 8080
ENTRYPOINT ["npm","run","start"]