FROM node:18.18.0-alpine3.18 as build

WORKDIR /app

COPY . .

RUN rm -rf build docs

WORKDIR /app/docusaurus

RUN yarn install

CMD [ "yarn", "start", "--host=0.0.0.0" ]
