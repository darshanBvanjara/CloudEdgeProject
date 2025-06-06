# Base image
FROM node:latest

# Create app directory
WORKDIR /usr/src/app/authentication

# Copy package files first to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose the port (ensure it matches process.env.PORT, e.g. 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
