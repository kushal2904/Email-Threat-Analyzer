FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Build React app
RUN npm run build

# Use simple HTTP server
RUN npm install -g serve

# Run application
CMD ["serve", "-s", "build", "-l", "3000"]
