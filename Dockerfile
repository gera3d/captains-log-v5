# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Set production environment variables
ENV VITE_REDIRECT_URL=https://idea.why57.com:5175

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

# --- NGINX Configuration for Single Page Application (SPA) ---
# Copy the properly formatted NGINX configuration file.
# Using new-nginx.conf which was created with proper encoding to avoid issues.
# The configuration ensures that NGINX serves the SPA correctly by redirecting
# all non-file requests to index.html, allowing client-side routing (React Router) to handle them.
COPY new-nginx.conf /etc/nginx/conf.d/default.conf
# --- End NGINX Configuration ---

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
