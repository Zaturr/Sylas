FROM node:20-alpine AS builder
WORKDIR /app
COPY Front/package.json Front/package-lock.json ./
RUN npm ci
COPY Front/ ./
RUN npm run build
EXPOSE 5173

# Stage 2: server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]