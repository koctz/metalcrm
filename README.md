# MetalCRM 🏗️

CRM система для управления проектами металлоконструкций.

## Особенности

✅ **Полная авторизация** - регистрация и вход с JWT токенами
✅ **Управление проектами** - создание, редактирование, удаление объектов
✅ **Финансовый учёт** - отслеживание платежей и договоров
✅ **Управление контактами** - сохранение контактов заказчиков
✅ **Аналитика** - портфель менеджеров и КПИ
✅ **Docker ready** - быстрое развёртывание
✅ **Production-ready** - готово для серьёзного использования

## Технологии

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: HTML/CSS/JavaScript
- **Deployment**: Docker + Docker Compose

## Быстрый старт (5 минут)

### Для разработки

```bash
git clone https://github.com/your-username/metalcrm.git
cd metalcrm
docker-compose up
```

Откройте http://localhost:5000

### Для production (VPS)

```bash
ssh root@your_vps_ip
git clone https://github.com/your-username/metalcrm.git
cd metalcrm
cp .env.example .env
# Отредактируйте .env с реальными параметрами!
nano .env
docker-compose -f docker-compose.prod.yml up -d
```

## Документация

- [Установка](docs/INSTALLATION.md) - Как установить локально
- [Развёртывание](docs/DEPLOYMENT.md) - Как развернуть на VPS
- [API](docs/API.md) - Документация API endpoints
- [Git структура](docs/GIT_STRUCTURE.md) - Организация репозитория

## Структура проекта

```
metalcrm/
├── backend/              # Node.js API
│   ├── config/          # Конфигурация БД
│   ├── routes/          # API маршруты
│   └── middleware/      # JWT проверка
├── frontend/            # HTML/CSS/JS UI
├── docker/              # Docker конфигурация
├── docs/                # Документация
└── db/                  # SQL скрипты
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Профиль

### Objects
- `GET /api/objects` - Список проектов
- `POST /api/objects` - Создать проект
- `PUT /api/objects/:id` - Обновить
- `DELETE /api/objects/:id` - Удалить

### Payments
- `GET /api/payments/:objectId` - История платежей
- `POST /api/payments/:objectId` - Добавить платёж
- `DELETE /api/payments/:id` - Удалить платёж

### Team
- `GET /api/team` - Портфель менеджеров
- `GET /api/team/my-stats` - Мои КПИ

## Требования

- Node.js 18+
- PostgreSQL 14+
- Docker + Docker Compose

## Разработка

```bash
# Запуск с автоперезагрузкой
cd backend
npm install
npm run dev
```

## Лицензия

MIT License - см. [LICENSE](LICENSE) файл

## Автор

Создано для системы управления металлоконструкциями.

---

Вопросы? Создайте Issue на GitHub!
