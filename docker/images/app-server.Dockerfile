# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV HUSKY=0

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends g++ make python3 \
	&& rm -rf /var/lib/apt/lists/* \
	&& corepack enable

WORKDIR /workspace

FROM base AS build

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @pakamew/server exec prisma generate
RUN pnpm --filter @pakamew/server run build
RUN pnpm --filter @pakamew/server --prod deploy --legacy /out

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build --chown=node:node /out/ ./

USER node

EXPOSE 3001

CMD ["node", "--enable-source-maps", "dist/main.node.js"]
