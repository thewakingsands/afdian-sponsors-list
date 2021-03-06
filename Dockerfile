FROM node:16 AS builder
WORKDIR /app
COPY package.json .yarnrc.yml yarn.lock /app/
COPY .yarn /app/.yarn
RUN yarn
COPY . /app/
RUN yarn build && yarn workspaces focus --all --production

FROM node:16-slim
WORKDIR /app
COPY --from=builder /app /app
CMD [ "node", "/app/dist/app.js" ]
