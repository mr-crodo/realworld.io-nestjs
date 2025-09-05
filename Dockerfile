
FROM ubuntu:latest
LABEL authors="mrcrodo"

# 1. Базовый образ с Node.js 18
FROM node:18-alpine AS builder

# 2. Рабочая директория в контейнере
WORKDIR /usr/src/app

# 3. Копируем package*.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# 4. Копируем весь код и собираем проект
COPY . .
RUN npm run build

# 5. Финальный легковесный образ
FROM node:18-alpine

WORKDIR /usr/src/app

# Копируем только необходимые артефакты из builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Указываем команду запуска
CMD ["node", "dist/main.js"]