# Build stage
FROM node:22.22-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY fyuri.client/package*.json ./
RUN npm ci

# Copy all source files
COPY fyuri.client/ ./

# Set production environment
ENV NODE_ENV=production

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx files
RUN rm -rf ./*

# Copy built files from build stage
COPY --from=build /app/dist .

# Copy nginx configuration
COPY fyuri.client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
