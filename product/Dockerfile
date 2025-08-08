# Use an official Node.js image as the base
FROM node:latest

# Create and set the working directory
WORKDIR /usr/src/app/product

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . . 
# not required now since local filesystem is mounted directly in container.

# Expose the port (ensure this matches your .env PORT)
EXPOSE 3001

# Start the service
CMD ["npm", "start"]
