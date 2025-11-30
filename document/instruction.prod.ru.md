# Руководство по продакшн развертыванию

## Предварительные требования

- Docker и Docker Compose установлены на продакшн сервере
- Доменное имя и SSL сертификат (рекомендуется для продакшн)
- Настройка обратного прокси (nginx, traefik или аналогичный)
- Стратегия резервного копирования базы данных
- Инфраструктура мониторинга и логирования

## Настройка переменных окружения

Создайте продакшн файл `.env.prod` с безопасными значениями:

```env
# --- Общие настройки ---
NODE_ENV=production

# --- База данных ---
POSTGRES_USER=your_production_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=realwordio_prod
POSTGRES_PORT=5432

# --- Приложение ---
APP_PORT=3000

# --- Безопасность (Опционально) ---
JWT_SECRET=your_very_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
```

**Примечание по безопасности**: Используйте сильные, случайно сгенерированные пароли и секреты в продакшн. Рассмотрите использование системы управления секретами.

## Пошаговые команды развертывания

### 1. Сборка продакшн образов

```bash
# Сборка продакшн образов
docker compose --profile prod build

# Сборка без кэша для чистой сборки
docker compose --profile prod build --no-cache
```

### 2. Запуск продакшн сервисов

```bash
# Запуск всех продакшн сервисов в фоновом режиме
docker compose --profile prod up -d

# Запуск с конкретным файлом окружения
docker compose --env-file .env.prod --profile prod up -d
```

### 3. Проверка развертывания

```bash
# Проверка статуса сервисов
docker compose --profile prod ps

# Просмотр логов
docker compose --profile prod logs

# Проверка здоровья приложения
curl http://localhost:3000
```

### 4. Остановка продакшн сервисов

```bash
# Корректная остановка сервисов
docker compose --profile prod down

# Остановка и удаление томов (используйте с осторожностью)
docker compose --profile prod down -v
```

## Конфигурация сервисов

### Продакшн сервис Backend (`backend_prod`)
- **Имя контейнера**: `backend_nest_prod`
- **Сборка**: Использует `Dockerfile.prod` (многоэтапная сборка)
- **Маппинг портов**: `${APP_PORT}:${APP_PORT}`
- **Окружение**: Продакшн режим с оптимизированными зависимостями
- **Безопасность**: Запускается от имени непривилегированного пользователя (UID 1001)
- **Политика перезапуска**: Всегда перезапускать при сбое

### Сервис PostgreSQL
- **Образ**: `postgres:15-alpine`
- **Имя контейнера**: `myapp_postgres`
- **Том**: Постоянный том `pgdata` для хранения данных
- **Проверка здоровья**: Автоматическая проверка готовности
- **Порт**: Открыт на хост-порту, указанном в окружении

## Оптимизация для продакшн

### 1. Ограничения ресурсов

Добавьте ограничения ресурсов в `docker-compose.yml`:

```yaml
services:
  backend_prod:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1'
    
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'
```

### 2. Резервное копирование базы данных

```bash
# Создание скрипта резервного копирования
#!/bin/bash
docker exec myapp_postgres pg_dump -U your_production_user realwordio_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из резервной копии
cat backup_file.sql | docker exec -i myapp_postgres psql -U your_production_user realwordio_prod
```

### 3. Управление логами

```bash
# Настройка ротации логов в docker-compose.yml
services:
  backend_prod:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Проверка работоспособности

### Здоровье приложения
```bash
# HTTP проверка здоровья
curl -f http://localhost:3000 || echo "Приложение нездорово"

# Проверка здоровья контейнера
docker inspect --format='{{.State.Health.Status}}' backend_nest_prod
```

### Здоровье базы данных
```bash
# Проверка подключения к базе данных
docker exec myapp_postgres pg_isready -U your_production_user -d realwordio_prod

# Размер и статус базы данных
docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "SELECT pg_database_size('realwordio_prod');"
```

### Мониторинг системы
```bash
# Использование ресурсов
docker stats

# Производительность контейнера
docker top backend_nest_prod

# Мониторинг логов
docker compose --profile prod logs --tail=100 -f
```

## Лучшие практики безопасности

### 1. Сетевая безопасность
```yaml
# В docker-compose.yml
networks:
  backend_net:
    driver: bridge
    internal: true  # Сделать сеть внутренней при использовании обратного прокси
```

### 2. Безопасность окружения
- Никогда не коммитьте `.env.prod` в систему контроля версий
- Используйте Docker secrets для чувствительных данных
- Регулярно меняйте пароли базы данных и JWT секреты

### 3. Безопасность контейнеров
```bash
# Регулярные обновления безопасности
docker compose --profile prod pull

# Сканирование образов на уязвимости
docker scan your-image-name
```

## Стратегии развертывания

### Blue-Green развертывание

1. **Настройка**:
   ```bash
   # Развертывание новой версии с другим именем проекта compose
   docker compose -p realworld-prod-v2 --profile prod up -d
   ```

2. **Переключение**: Обновите обратный прокси для указания на новую версию

3. **Очистка**: Удалите старую версию
   ```bash
   docker compose -p realworld-prod-v1 down
   ```

### Плавающие обновления

```bash
# Обновление приложения без простоя
docker compose --profile prod up -d --force-recreate

# Обновление конкретного сервиса
docker compose --profile prod up -d --force-recreate backend_prod
```

## Операции обслуживания

### Обслуживание базы данных
```bash
# Запуск вакуума базы данных
docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "VACUUM ANALYZE;"

# Проверка статистики базы данных
docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "\dt+"
```

### Обслуживание приложения
```bash
# Просмотр запущенных процессов
docker exec backend_nest_prod ps aux

# Проверка использования памяти
docker exec backend_nest_prod free -m

# Метрики приложения
docker exec backend_nest_prod npm run start:prod -- --metrics
```

### Резервное копирование и восстановление

```bash
# Полная процедура резервного копирования
#!/bin/bash
# Резервное копирование базы данных
docker exec myapp_postgres pg_dump -U your_production_user realwordio_prod > /backups/db_backup_$(date +%Y%m%d).sql

# Резервное копирование томов
docker run --rm -v pgdata:/volume -v /backups:/backup alpine tar czf /backup/pgdata_$(date +%Y%m%d).tar.gz -C /volume ./

# Ротация старых резервных копий (хранить 30 дней)
find /backups -name "*.sql" -mtime +30 -delete
find /backups -name "*.tar.gz" -mtime +30 -delete
```

## Устранение проблем в продакшн

### Распространенные проблемы продакшн

1. **Проблемы с памятью**:
   ```bash
   # Проверка использования памяти
   docker stats

   # При необходимости увеличьте лимиты памяти
   ```

2. **Производительность базы данных**:
   ```bash
   # Мониторинг запросов базы данных
   docker exec myapp_postgres psql -U your_production_user -d realwordio_prod -c "SELECT * FROM pg_stat_activity;"
   ```

3. **Ошибки приложения**:
   ```bash
   # Проверка логов приложения
   docker compose --profile prod logs backend_prod

   # Перезапуск приложения
   docker compose --profile prod restart backend_prod
   ```

### Экстренные процедуры

```bash
# Экстренный перезапуск
docker compose --profile prod restart

# Откат к предыдущей версии
docker compose --profile prod up -d --force-recreate

# Полная пересборка
docker compose --profile prod down
docker compose --profile prod build --no-cache
docker compose --profile prod up -d
```

## Мониторинг и оповещения

### Рекомендуемая настройка мониторинга

1. **Prometheus + Grafana** для метрик
2. **ELK Stack** для логирования
3. **Эндпоинты проверки здоровья** для мониторинга приложения
4. **Мониторинг базы данных** с pg_stat statements

### Эндпоинты здоровья

Убедитесь, что ваше приложение имеет:
- Эндпоинт `/health` для базовых проверок здоровья
- Эндпоинт `/metrics` для метрик Prometheus
- Эндпоинт `/ready` для проверок готовности

Эта продакшн настройка обеспечивает надежное, масштабируемое развертывание с правильными практиками безопасности и процедурами обслуживания.