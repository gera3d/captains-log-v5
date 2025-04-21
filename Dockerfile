# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY client/package.json client/package-lock.json* ./client/
# If using yarn, copy yarn.lock instead
# COPY client/package.json client/yarn.lock ./client/

# Install client dependencies
RUN cd client && npm install
# If using yarn:
# RUN cd client && yarn install

# Copy the rest of the client application code
COPY client/ ./client/

# Build the client application
RUN cd client && npm run build
# If using yarn:
# RUN cd client && yarn build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build /app/client/dist .
# If your build output is in 'build' folder instead of 'dist', use:
# COPY --from=build /app/client/build .

# Copy custom Nginx configuration (optional, but recommended for SPAs)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# --- Optional: Create nginx.conf for Single Page Application routing ---
# If you need client-side routing to work correctly, create a file
# named 'nginx.conf' in the same directory as the Dockerfile with content like:
#
# server {
#   listen 80;
#   server_name localhost;
#
#   root /usr/share/nginx/html;
#   index index.html index.htm;
#
#   location / {
#     try_files $uri $uri/ /index.html;
#   }
#
#   # Optional: Add configuration for API proxy if needed
#   # location /api {
#   #   proxy_pass http://your-backend-api:port;
#   #   proxy_set_header Host $host;
#   #   proxy_set_header X-Real-IP $remote_addr;
#   #   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#   #   proxy_set_header X-Forwarded-Proto $scheme;
#   # }
# }
#
# Then uncomment the line `COPY nginx.conf ...` above.
