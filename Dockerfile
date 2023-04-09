FROM node:18.15-bullseye-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
# node-canvas doesn't have an ARM64 build...
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*
RUN npm ci
COPY . .
RUN npm run build

FROM node:18.15-bullseye-slim AS run
ENV NODE_ENV production
# node-canvas doesn't have an ARM64 build...
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*
USER node
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
RUN npm ci --production
COPY --from=build --chown=node:node /usr/src/app/dist ./dist

EXPOSE 8000
CMD [ "node", "dist/app.js" ]