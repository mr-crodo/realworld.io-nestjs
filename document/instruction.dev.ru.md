# Руководство по настройке локальной разработки

## Предварительные требования

- Docker и Docker Compose установлены в вашей системе
- Node.js 18+ (для локальной разработки при необходимости)
- Git

## Настройка переменных окружения

Создайте или обновите файл `.env` в корне проекта со следующими переменными:

```env
# --- Общие настройки ---
NODE_ENV=development

# --- База данных ---
POSTGRES_HOST_LOCAL=postgres
POSTGRES_PORT_LOCAL=5432
POSTGRES_USER=crodo
POSTGRES_PASSWORD=mypassword123
POSTGRES_DB=realwordio
POSTGRES_PORT=5433   # Порт хоста, чтобы избежать конфликта с локальным PostgreSQL

# --- Приложение NestJS ---
APP_PORT=3000
```

## Пошаговые команды выполнения

### 1. Запуск среды разработки (все сервисы вместе)

```bash
# Использование основного docker-compose.yml с профилем dev
docker compose --profile dev up

# Или использование конкретной команды для разработки
docker compose -f docker-compose.yml --profile dev up
```

### 2. Запуск сервисов по отдельности (для просмотра логов отдельно)

#### Запуск только PostgreSQL
```bash
# Запуск только базы данных
docker compose up postgres

# Запуск в фоновом режиме
docker compose up -d postgres

# Просмотр логов PostgreSQL
docker compose logs -f postgres
```

#### Запуск только NestJS приложения
```bash
# Сначала убедитесь, что PostgreSQL запущен
docker compose up -d postgres

# Затем запустите backend в отдельном терминале
docker compose up backend_dev

# Или в фоновом режиме
docker compose up -d backend_dev

# Просмотр логов NestJS приложения
docker compose logs -f backend_dev
```

#### Запуск в разных терминалах для отдельного просмотра логов
```bash
# Терминал 1: PostgreSQL
docker compose up postgres

# Терминал 2: NestJS приложение
docker compose up backend_dev
```

### 3. Сборка и запуск сервисов

```bash
# Сборка и запуск всех сервисов в фоновом режиме
docker compose --profile dev up -d

# Сборка конкретных сервисов
docker compose --profile dev build
```

### 4. Просмотр логов

```bash
# Просмотр логов всех сервисов
docker compose --profile dev logs

# Отслеживание логов конкретного сервиса
docker compose --profile dev logs -f backend_dev

# Просмотр логов PostgreSQL
docker compose logs -f postgres
```

### 5. Остановка сервисов

```bash
# Остановка всех сервисов
docker compose --profile dev down

# Остановка сервисов и удаление томов
docker compose --profile dev down -v

# Остановка конкретного сервиса
docker compose stop backend_dev
docker compose stop postgres
```

## Конфигурация сервисов

### Сервис разработки Backend (`backend_dev`)
- **Имя контейнера**: `backend_nest_dev`
- **Сборка**: Использует `Dockerfile.dev`
- **Маппинг портов**: `${APP_PORT}:${APP_PORT}` (по умолчанию: 3000:3000)
- **Тома**:
  - Локальный код смонтирован в `/usr/src/app`
  - Локальный `node_modules` смонтирован для избежания конфликтов
- **Окружение**: Режим разработки с горячей перезагрузкой через nodemon
- **Проверка здоровья**: Ожидает готовности PostgreSQL

### Сервис PostgreSQL
- **Образ**: `postgres:15-alpine`
- **Имя контейнера**: `myapp_postgres`
- **Маппинг портов**: `${POSTGRES_PORT}:5432` (по умолчанию: 5433:5432)
- **Том**: Постоянное хранение данных в томе `pgdata`
- **Проверка здоровья**: Использует `pg_isready` для проверки готовности базы данных

## Проверка работоспособности

### Проверка здоровья базы данных
```bash
# Проверка готовности PostgreSQL
docker exec myapp_postgres pg_isready -U crodo -d realwordio

# Ожидаемый вывод: "localhost:5432 - accepting connections"
```

### Проверка здоровья приложения
```bash
# Проверка работы NestJS приложения
curl http://localhost:3000

# Проверка логов приложения
docker logs backend_nest_dev
```

### Статус сервисов
```bash
# Проверка запущенных сервисов
docker compose --profile dev ps

# Проверка статуса здоровья сервиса
docker inspect --format='{{.State.Health.Status}}' myapp_postgres
```

## Рабочий процесс разработки

### Разработка с горячей перезагрузкой
- Настройка разработки использует nodemon для автоматического перезапуска при изменении файлов
- Изменения исходного кода немедленно отражаются в запущенном контейнере
- TypeScript файлы компилируются на лету с использованием ts-node

### Операции с базой данных
```bash
# Запуск миграций базы данных
docker exec backend_nest_dev npm run migration:run

# Генерация новой миграции
docker exec backend_nest_dev npm run migration:generate

# Откат последней миграции
docker exec backend_nest_dev npm run migration:revert
```

### Тестирование
```bash
# Запуск тестов внутри контейнера
docker exec backend_nest_dev npm test

# Запуск тестов с покрытием
docker exec backend_nest_dev npm run test:cov

# Запуск e2e тестов
docker exec backend_nest_dev npm run test:e2e
```

## Отладка и мониторинг

### Подключение к контейнерам
```bash
# Подключение к контейнеру NestJS
docker exec -it backend_nest_dev sh

# Подключение к контейнеру PostgreSQL
docker exec -it myapp_postgres psql -U crodo -d realwordio
```

### Просмотр ресурсов
```bash
# Мониторинг использования ресурсов
docker stats

# Просмотр процессов в контейнере
docker top backend_nest_dev
```

## Устранение неполадок

### Распространенные проблемы

1. **Конфликты портов**:
   - Измените `POSTGRES_PORT` в `.env`, если 5433 занят
   - Измените `APP_PORT`, если 3000 занят

2. **Проблемы с правами доступа**:
   - Убедитесь, что Docker имеет правильные разрешения для монтирования томов

3. **Проблемы со сборкой**:
   - Очистите кэш Docker: `docker builder prune`
   - Пересоберите образы: `docker compose --profile dev build --no-cache`

4. **Проблемы подключения к базе данных**:
   - Проверьте, что PostgreSQL запущен: `docker compose --profile dev ps`
   - Проверьте логи базы данных: `docker compose --profile dev logs postgres`

### Логи и отладка

```bash
# Детальная инспекция сервиса
docker inspect backend_nest_dev

# Просмотр переменных окружения
docker exec backend_nest_dev env

# Доступ к оболочке контейнера
docker exec -it backend_nest_dev sh
```

## Очистка

```bash
# Остановка и удаление всех контейнеров, сетей и томов
docker compose --profile dev down -v

# Удаление неиспользуемых ресурсов Docker
docker system prune
```

## Полезные команды для разработки

### Работа с базой данных
```bash
# Подключение к PostgreSQL через psql
docker exec -it myapp_postgres psql -U crodo -d realwordio

# Создание дампа базы данных
docker exec myapp_postgres pg_dump -U crodo realwordio > backup.sql

# Восстановление из дампа
cat backup.sql | docker exec -i myapp_postgres psql -U crodo realwordio
```

### Работа с приложением
```bash
# Установка новых зависимостей
docker exec backend_nest_dev npm install package-name

# Запуск конкретных скриптов
docker exec backend_nest_dev npm run build
docker exec backend_nest_dev npm run start:dev
```

Эта настройка разработки обеспечивает полную локальную среду с возможностями горячей перезагрузки и отдельного просмотра логов каждого сервиса, что идеально подходит для разработки и тестирования.