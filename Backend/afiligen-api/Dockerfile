FROM node:20-slim

ARG ENV=dev
ENV NODE_ENV=$ENV
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    wget \
    xdg-utils \
    gconf-service \
    libgtk-3-0 \
    libxss1 \
    libxtst6 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm install

COPY . .

# 👇 COMANDO AUTOMÁTICO baseado no ambiente
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'production' ]; then npm run start:prod; else npm run start:dev; fi"]
