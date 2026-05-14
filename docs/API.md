# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Все запросы (кроме /auth/register и /auth/login) требуют JWT токен:

```
Authorization: Bearer <token>
```

## Endpoints

### Auth
```
POST   /auth/register    Регистрация
POST   /auth/login       Вход
GET    /auth/me          Профиль
```

### Objects
```
GET    /objects          Список
POST   /objects          Создать
PUT    /objects/:id      Обновить
DELETE /objects/:id      Удалить
```

### Payments
```
GET    /payments/:id     История
POST   /payments/:id     Добавить
DELETE /payments/:id     Удалить
```

### Team
```
GET    /team             Портфель
GET    /team/my-stats    Мои КПИ
```

## Примеры

### Регистрация
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ivan_petrov",
    "email": "ivan@company.com",
    "password": "Test123!",
    "full_name": "Иван Петров"
  }'
```

### Вход
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@company.com",
    "password": "Test123!"
  }'
```

Результат:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "ivan_petrov", ... }
}
```

### Получить объекты
```bash
curl http://localhost:5000/api/objects \
  -H "Authorization: Bearer <token>"
```

