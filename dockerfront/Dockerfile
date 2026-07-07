FROM node:20-alpine 
WORKDIR /app
COPY Front/package.json Front/package-lock.json ./
RUN npm ci
COPY Front/ ./
RUN npm run build
EXPOSE 5173
