# Use the official Node.js image.
# https://hub.docker.com/_/node
ARG NODE_VERSION=21.6.0

FROM node:${NODE_VERSION}-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app


# Copy the package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application code
COPY . .

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Define environment variable
ENV NODE_ENV=development

# Run the app
CMD ["node", "index.js"]
