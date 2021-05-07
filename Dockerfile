FROM node:15-alpine

ENV NODE_ENV production
WORKDIR /srv/app

COPY . .

RUN mkdir /.yarn && chmod g+rwx -R /.yarn && \
    mkdir -p /.cache/yarn && chmod -R g+rwx /.cache/yarn && \
    yarn --frozen-lockfile && yarn cache clean && \
    mkdir -p ./node_modules/.prisma/client && yarn build && \
    rm ./node_modules/.prisma/client/schema.prisma && \
    chgrp -R 0 /srv/app && chmod g+rwx -R /srv/app

CMD yarn prisma generate && yarn prisma db push && yarn start
