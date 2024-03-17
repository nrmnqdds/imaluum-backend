# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM node:20 as base
WORKDIR /usr/src/app

# copy production dependencies and source code into final image
FROM base AS release
COPY . .
RUN npm install

# run the app
# USER bun
EXPOSE 3000/tcp

# ENTRYPOINT [ "bun", "--import", "tsx", "src/index.ts"]
