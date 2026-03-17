FROM node:20-slim

# Install Java (JDK 17)
RUN apt-get update && \
    apt-get install -y default-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Java installation
RUN java -version && javac -version

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the backend files
COPY . .

# Expose port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]
