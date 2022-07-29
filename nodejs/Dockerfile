FROM node:12-alpine
#ENV NODE_ENV=production

WORKDIR /app


COPY ["package.json", "package-lock.json*", "./"]

COPY tsconfig.json .
RUN npm install && npm install typescript -g
COPY . .

RUN tsc # Files ts->js
EXPOSE 3000
CMD [ "node", "./build/app.js" ]
