FROM node:20.17.0

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon

RUN npm install -g yarn || true

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]