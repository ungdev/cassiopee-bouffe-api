FROM node:15-alpine

ENV NODE_ENV production
WORKDIR /srv/app

RUN chown -R node:node /srv/app
USER 1000

COPY --chown=node package.json yarn.lock schema.prisma ./

RUN yarn --frozen-lockfile && yarn cache clean

COPY --chown=node ./ ./


RUN yarn prisma generate
RUN yarn build

CMD yarn prisma db push && yarn start