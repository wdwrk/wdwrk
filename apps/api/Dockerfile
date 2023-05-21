FROM node:18-alpine AS builder

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /usr/api

COPY manifests .

RUN npm install --global is-ci husky

RUN yarn install --immutable --inline-builds
RUN rm -rf .yarn/cache

FROM node:18-alpine AS runner

WORKDIR /usr/api

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api
USER api

COPY --from=builder /usr/api .
COPY packs .

CMD ["node", "--enable-source-maps", "apps/api/dist/index.js"]
