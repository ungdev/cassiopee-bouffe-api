FROM node:15-alpine

ENV NODE_ENV=production
WORKDIR /opt

RUN chown node:node .

USER node

COPY package.json yarn.lock schema.prisma ./

RUN yarn --frozen-lockfile

COPY ./ ./

RUN yarn prisma generate
RUN yarn build

# TODO: add yarn prisma create columns in CMD
CMD yarn start