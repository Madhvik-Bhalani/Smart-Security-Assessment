# Node.js image
FROM node:18-alpine

# set dir
WORKDIR /app

# Dependencies copy & install
COPY package.json package-lock.json ./
RUN npm install

# copy react file
COPY . .

# React app build
RUN npm run build

# Serve npm 
RUN npm install -g serve

# expose port
EXPOSE 3000

# React app serve
CMD ["serve", "-s", "build", "-l", "3000"]
