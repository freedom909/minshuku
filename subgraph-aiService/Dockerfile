# Use official Node.js LTS
FROM node:22
# gateway Dockerfile

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Run Node server
CMD ["node", "index.js"]
