FROM node:12.22-alpine as development

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

# generated prisma files
COPY prisma ./prisma/

RUN yarn cache clean
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:12.22-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

# generated prisma files
COPY prisma ./prisma/

RUN yarn cache clean
RUN yarn install --only=production --frozen-lockfile

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/src/main"]
