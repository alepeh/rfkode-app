FROM mhart/alpine-node:12
LABEL maintainer "Alexander Pehm <alexander@alexanderpehm.at>"

#RUN apk add --no-cache nodejs npm

COPY . ./
RUN export NODE_OPTIONS=--max_old_space_size=8192 && npm install && npm run build
RUN cd server && npm install
WORKDIR server
EXPOSE 8080
ENTRYPOINT ["npm","run","start"]