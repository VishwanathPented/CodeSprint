# Use a more official and stable Node image
FROM node:18-bullseye

# Install OpenJDK 17 and clean up to keep image small
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Ensure we have a temp directory for Java compilation with correct permissions
RUN mkdir -p /app/temp && chmod 777 /app/temp

# Copy package management files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 5000

# Start with node directly for better signal handling
CMD ["node", "server.js"]
