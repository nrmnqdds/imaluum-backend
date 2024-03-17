# LABEL org.opencontainers.image.source https://github.com/nrmnqdds/imaluum-backend

FROM node:20-buster-slim as base
WORKDIR /usr/src/app

# copy production dependencies and source code into final image
FROM base AS release
COPY . .
RUN npm ci

ENTRYPOINT ["node", "--import", "tsx", "src/index.ts"]