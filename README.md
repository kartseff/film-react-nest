# FILM!

Сервис покупки билетов в кино: React-фронтенд, NestJS API и PostgreSQL.
Приложение и API публикуются через nginx.

## Развёрнутое приложение

[http://kartdomain.nomorepartiessite.ru](http://kartdomain.nomorepartiessite.ru)

API доступно с тем же origin по пути `/api/afisha`, статические материалы — по пути `/content/afisha`.

## Состав проекта

- `frontend` — SPA на React и Vite;
- `backend` — REST API на NestJS;
- `nginx` — production-сборка фронтенда, SPA fallback и reverse proxy;
- `backend/test` — SQL-скрипты создания и наполнения PostgreSQL;
- `docker-compose.yml` — локальная сборка и запуск всего приложения;
- `docker-compose.server.yml` — запуск опубликованных образов из GHCR;
- `.github/workflows` — проверки и публикация Docker-образов.

## Переменные окружения

Для Docker Compose создайте корневой `.env` из примера:

```bash
cp .env.example .env
```

Перед запуском замените демонстрационные пароли. Значения пользователя, пароля и базы в `DATABASE_URL` должны совпадать с `POSTGRES_USER`, `POSTGRES_PASSWORD` и `POSTGRES_DB`.

Переменная `LOGGER` выбирает формат серверных логов:

- `DEV` — стандартный цветной логгер NestJS;
- `JSON` — JSON-записи для машинной обработки;
- `TSKV` — плоские tab-separated key-value записи.

Для запуска бэкенда без Docker используйте `backend/.env.example`, для локального Vite-сервера — `frontend/.env.example`.

## Локальная разработка

Бэкенд:

```bash
cd backend
cp .env.example .env
npm ci
npm run start:dev
```

Фронтенд в другом терминале:

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

## Проверки

```bash
cd backend
npm ci
npm run format:check
npm run lint
npm test -- --runInBand
npm run build

cd ../frontend
npm ci
npm run lint
npm run build
```

## Запуск в Docker

Из корня репозитория:

```bash
cp .env.example .env
docker compose config
docker compose up -d --build
docker compose ps
```

После запуска доступны:

- приложение — `http://localhost`;
- pgAdmin — `http://localhost:8080`.

При первом создании volume PostgreSQL автоматически выполняет `prac.init.sql`, `prac.films.sql` и `prac schedules.sql`. Повторный запуск не перезаписывает существующую базу.

Остановка приложения:

```bash
docker compose down
```

## Публикация образов

Workflow `.github/workflows/publish.yml` при push в `main` проверяет оба приложения, собирает production-образы и публикует теги `latest` и SHA коммита:

- `ghcr.io/kartseff/film-react-nest-backend`;
- `ghcr.io/kartseff/film-react-nest-frontend`.

Для публикации используется автоматически созданный `GITHUB_TOKEN` с правом `packages: write`.

## Запуск на сервере

Скопируйте на сервер `docker-compose.server.yml` и подготовленный `.env`, затем выполните:

```bash
docker compose -f docker-compose.server.yml pull
docker compose -f docker-compose.server.yml up -d
docker compose -f docker-compose.server.yml ps
```

Если GHCR-пакеты приватные, перед `pull` авторизуйтесь с Personal Access Token, имеющим право `read:packages`:

```bash
docker login ghcr.io -u <github-login>
```

Серверный Compose сохраняет данные PostgreSQL и pgAdmin в именованных volumes.
Начальные SQL-файлы в серверный Compose намеренно не монтируются. Скопируйте их
на сервер и выполните по одному разу в таком порядке:

1. `backend/test/prac.init.sql`;
2. `backend/test/prac.films.sql`;
3. `backend/test/prac.schedules.sql`.

Например, находясь рядом с SQL-файлами на сервере:

```bash
docker compose -f docker-compose.server.yml exec -T database \
  sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < prac.init.sql
docker compose -f docker-compose.server.yml exec -T database \
  sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < prac.films.sql
docker compose -f docker-compose.server.yml exec -T database \
  sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < prac.schedules.sql
```

pgAdmin в production привязан только к `127.0.0.1:8080`. При необходимости
откройте SSH-туннель `ssh -L 8080:127.0.0.1:8080 <user>@<server-ip>` и перейдите
на локальный адрес `http://localhost:8080`. В подключении pgAdmin укажите host
`database`, port `5432` и значения `POSTGRES_*` из серверного `.env`.
