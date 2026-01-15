# Constructed with help from Ryan Hill
# https://www.youtube.com/watch?v=whHvRZZG9WQ

# Node Version: v18
FROM node:18-slim

# Set the working directory (where we're going to store the files of this project)
WORKDIR /usr/src/trash-ai-api-node

# Build Dependencies
RUN apt-get update && apt-get install -y \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json in the file, so that node knows what dependencies to install.
COPY package*.json ./

# Install node + dependencies
RUN npm install

# Copy the rest of the application files in the directory
COPY . .

# Expose the port(s) that the application listens to
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start-api"]