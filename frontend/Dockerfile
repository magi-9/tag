# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Set environment variables for build
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Build application
RUN npm run build

# Production stage - serve with Nginx
FROM nginx:alpine

# Copy built assets to nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional, we use external nginx)
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
