FROM node:20-buster-slim as base
LABEL org.opencontainers.image.source https://github.com/nrmnqdds/imaluum-backend

WORKDIR /usr/src/app

# copy production dependencies and source code into final image
FROM base AS release
COPY . .
RUN npm ci

ENTRYPOINT ["node", "--import", "tsx", "src/index.ts"]