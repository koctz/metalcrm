# Установка MetalCRM

## Системные требования

- Node.js v18+
- Docker + Docker Compose ИЛИ PostgreSQL 14+
- Git

## Вариант 1: Docker (рекомендуется)

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/metalcrm.git
cd metalcrm

# Запустите Docker
docker-compose up

# База готова автоматически!
```

Откройте: http://localhost:5000

## Вариант 2: Локальная установка

### 1. Установите PostgreSQL

```bash
# macOS
brew install postgresql@14

# Ubuntu
sudo apt-get install postgresql postgresql-contrib

# Windows
# Скачайте с https://www.postgresql.org/
```

### 2. Создайте базу данных

```bash
psql -U postgres
CREATE DATABASE metalcrm;
\c metalcrm
\i db/init.sql
```

### 3. Установите backend

```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env
npm run dev
```

Сервер на: http://localhost:5000

### 4. Откройте frontend

Просто откройте `frontend/index.html` в браузере

## Переменные окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Обязательные переменные:
- `DB_PASSWORD` - пароль PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT

## Решение проблем

### Порт уже используется
```bash
# Смените PORT в .env
PORT=5001
```

### PostgreSQL не подключается
```bash
# Проверьте что запущена
psql -U postgres

# Проверьте параметры в .env
DB_HOST=localhost
DB_USER=postgres
```

