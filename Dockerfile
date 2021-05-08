# This image is optimized to work with openshift requirements
# More info on contraints on https://docs.openshift.com/container-platform/4.7/openshift_images/create-images.html#images-create-guide-openshift_create-images
FROM node:15-alpine

# Set the application to production (does not download dev depedencies)
ENV NODE_ENV production
WORKDIR /srv/app
EXPOSE 3000

# Copy the package.json and yarn.lock. This is used to cache and avoid to download the dependencies every time
COPY ./package.json ./yarn.lock ./

# Create folders that will be used for build time
RUN mkdir -p /.yarn /.cache/yarn && \
    chmod -R g=u /.yarn /.cache/yarn && \
    yarn --frozen-lockfile && yarn cache clean && \
    chgrp -R 0 . && chmod -R g=u .

COPY . .

RUN yarn prisma generate && \
    yarn build && \
    chgrp -R 0 . && chmod -R g=u . && \
    rm ./node_modules/.prisma/client/schema.prisma

# Set a random uid and the root gid
USER 5000:0

CMD yarn prisma generate && yarn prisma db push && yarn start
