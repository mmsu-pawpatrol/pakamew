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
RUN pnpm --filter @pakamew/livestream-node --prod deploy --legacy /out

FROM node:24-bookworm-slim AS runtime

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends ffmpeg \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV LIVESTREAM_NODE_SCRIPT=start:wifi:ome

COPY --from=build --chown=node:node /out/ ./

USER node

EXPOSE 3000

CMD ["sh", "-c", "case \"$LIVESTREAM_NODE_SCRIPT\" in start:wifi) exec node server-wifi.js ;; start:wifi:ome) exec node -e \"process.env.ENABLE_OME_FORWARD='true'; require('./server-wifi.js')\" ;; start:wired) exec node server-wired.js ;; start:webcam) exec node server-webcam.js ;; start:webcam:ome) exec node -e \"process.env.ENABLE_OME_FORWARD='true'; require('./server-webcam.js')\" ;; *) echo \"Unknown LIVESTREAM_NODE_SCRIPT: $LIVESTREAM_NODE_SCRIPT\" >&2; exit 1 ;; esac"]
