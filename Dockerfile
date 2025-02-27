FROM node:18-alpine as development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN yarn build

FROM node:18-alpine as production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma

CMD ["sh", "-c", "yarn db:deploy && node dist/server.js"]
