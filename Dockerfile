FROM node:16 AS builder
WORKDIR /app
COPY . /app/
RUN yarn
COPY . /app/
RUN yarn build && yarn workspaces focus --all --production

FROM node:16-slim
WORKDIR /app
COPY --from=builder /app /app
RUN [ "node", "/app/dist/app.js" ]
