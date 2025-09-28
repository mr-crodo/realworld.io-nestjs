# Руководство по работе с Entity и миграциями

## Команды для работы с миграциями

### 1. Генерация миграции
```bash
# Генерация миграции с указанием пути и имени файла
npm run typeorm migration:generate src/migrations/CreateArticles

# Или с полным путем
npm run typeorm migration:generate -- src/migrations/CreateArticles

# Альтернативный способ
npx typeorm migration:generate src/migrations/CreateArticles -d src/ormdatasource.ts
```

### 2. Запуск миграций
```bash
# Применить все неприменённые миграции
npm run migration:run

# Или напрямую через typeorm
npm run typeorm migration:run
```

### 3. Откат миграций
```bash
# Откатить последнюю миграцию
npm run migration:revert

# Или напрямую через typeorm
npm run typeorm migration:revert
```

### 4. Создание пустой миграции
```bash
# Создать пустую миграцию для ручного написания SQL
npm run typeorm migration:create src/migrations/CustomMigration
```

### 5. Работа со схемой базы данных
```bash
# Удалить всю схему базы данных (ОСТОРОЖНО!)
npm run db:drop

# Синхронизировать схему с entity (для разработки)
npm run db:create
```

## Пример команд для вашего случая

### Для создания миграции для ArticleEntity:
```bash
# Генерация миграции для статей
npm run typeorm migration:generate src/migrations/CreateArticles

# Или с более описательным именем
npm run typeorm migration:generate src/migrations/AddArticleEntity
```

### Применение миграции:
```bash
# Запуск миграции в базу данных
npm run migration:run
```

## Структура команд в package.json

Ваши текущие команды в package.json:
```json
{
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d src/ormdatasource.ts",
  "db:drop": "npm run typeorm schema:drop",
  "db:create": "npm run typeorm schema:sync", 
  "migration:generate": "npm run typeorm migration:generate",
  "migration:run": "npm run typeorm migration:run",
  "migration:revert": "npm run typeorm migration:revert"
}
```

## Исправленные команды

Проблема в том, что команда `migration:generate` требует путь к файлу. Вот правильные команды:

### Способ 1: Прямое использование
```bash
npm run typeorm migration:generate src/migrations/CreateArticles
```

### Способ 2: Через Docker (если используете контейнеры)
```bash
# Если приложение запущено в Docker
docker exec backend_nest_dev npm run typeorm migration:generate src/migrations/CreateArticles

# Применение миграции в Docker
docker exec backend_nest_dev npm run migration:run
```

## Полный рабочий процесс

### 1. Создание Entity
- Создайте или измените файл entity (как ваш `article.entity.ts`)

### 2. Генерация миграции
```bash
npm run typeorm migration:generate src/migrations/CreateArticles
```

### 3. Проверка миграции
- Откройте созданный файл миграции в папке `src/migrations/`
- Проверьте SQL команды

### 4. Применение миграции
```bash
npm run migration:run
```

### 5. Проверка результата
```bash
# Подключение к базе данных для проверки
docker exec -it myapp_postgres psql -U crodo -d realwordio

# Просмотр таблиц
\dt

# Просмотр структуры таблицы articles
\d articles
```

## Полезные команды для отладки

### Проверка статуса миграций
```bash
npm run typeorm migration:show
```

### Проверка подключения к базе данных
```bash
npm run typeorm query "SELECT NOW()"
```

### Просмотр схемы
```bash
npm run typeorm schema:log
```

## Примечания

1. **Путь к миграции**: Всегда указывайте полный путь `src/migrations/ИмяМиграции`
2. **Имя миграции**: Используйте описательные имена (CreateArticles, AddUserTable, etc.)
3. **Проверка**: Всегда проверяйте сгенерированную миграцию перед применением
4. **Бэкап**: Делайте бэкап базы данных перед применением миграций в продакшн

## Команды для Docker окружения

Если вы работаете в Docker контейнере:

```bash
# Генерация миграции в контейнере
docker exec backend_nest_dev npm run typeorm migration:generate src/migrations/CreateArticles

# Применение миграции в контейнере  
docker exec backend_nest_dev npm run migration:run

# Откат миграции в контейнере
docker exec backend_nest_dev npm run migration:revert
```