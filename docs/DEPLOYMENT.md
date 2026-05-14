# Развёртывание на VPS

## Digital Ocean ($6/месяц)

### 1. Создайте Droplet
- Ubuntu 22.04
- 2GB RAM
- 50GB SSD

### 2. Подключитесь по SSH
```bash
ssh root@your_ip
```

### 3. Установите зависимости
```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose git curl
```

### 4. Клонируйте проект
```bash
git clone https://github.com/your-username/metalcrm.git
cd metalcrm
```

### 5. Создайте .env
```bash
cp .env.example .env
nano .env
```

Важные переменные:
```
DB_PASSWORD=your_strong_password_here
JWT_SECRET=your_super_secret_key_here
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### 6. Запустите Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 7. Проверьте логи
```bash
docker-compose logs -f
```

### 8. Настройте домен (опционально)

Обновите DNS записи чтобы указывали на IP вашего сервера.

## Мониторинг

```bash
# Посмотреть логи
docker-compose logs -f backend

# Перезагрузить сервисы
docker-compose restart

# Остановить
docker-compose stop
```

## Резервные копии БД

```bash
# Бекап
docker-compose exec postgres pg_dump -U postgres metalcrm > backup.sql

# Восстановление
docker-compose exec -T postgres psql -U postgres metalcrm < backup.sql
```

