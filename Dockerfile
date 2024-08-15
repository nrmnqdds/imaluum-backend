FROM node:20-buster-slim as base
LABEL org.opencontainers.image.source https://github.com/nrmnqdds/imaluum-backend

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apk add --no-cache gcompat
WORKDIR /app

COPY pnpm-lock.yaml ./

# RUN npm ci
FROM base AS build
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS release
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 3000
CMD [ "pnpm", "start" ]
