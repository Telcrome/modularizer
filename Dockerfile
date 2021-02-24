FROM node:12.18-alpine
ENV NODE_ENV=production
ENV MyKey=1234
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install -g typescript
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
