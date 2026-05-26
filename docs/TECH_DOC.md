# MIG Tender — Техническая документация

> Документация для разработчиков, которые поддерживают и развивают платформу.
> **Источник истины — код.** Этот документ описывает фактическое поведение по
> состоянию кодовой базы на момент написания (май 2026). Где поведение
> неочевидно — приведено короткое «почему». Легаси-участки помечены явно.

Репозитории (оба на диске разработчика):

| Часть | Стек | Путь |
|-------|------|------|
| Фронтенд | Next.js 16 (App Router, Turbopack) | `/Users/rahim/Desktop/mig-tender/mig-tender-front` |
| Бэкенд | Django 5 + DRF + Celery + Channels | `/Users/rahim/Desktop/mig-tender/auction` |

База API: `…/api/v1/`. Прод-бэкенд: `https://backend.migtender.ru` (legacy: `backend.migntender.app`).

---

## Оглавление

1. [Обзор и архитектура](#1-обзор-и-архитектура)
2. [Стек и инфраструктура](#2-стек-и-инфраструктура)
3. [Структура репозиториев](#3-структура-репозиториев)
4. [Аутентификация и роли](#4-аутентификация-и-роли)
5. [Доменные модели](#5-доменные-модели)
6. [Бизнес-логика и флоу](#6-бизнес-логика-и-флоу)
7. [API-справочник](#7-api-справочник)
8. [Realtime (WebSocket)](#8-realtime-websocket)
9. [Уведомления](#9-уведомления)
10. [Разработка](#10-разработка)

---

## 1. Обзор и архитектура

**MIG Tender** — маркетплейс-аукционы недвижимости. Девелопер выставляет объекты,
брокеры участвуют в аукционах (открытых и закрытых), победитель заключает сделку,
платформа берёт комиссию и проводит расчёты между девелопером и брокером.

### Роли

| Роль | Кто | Что делает |
|------|-----|-----------|
| **Broker** (брокер) | регистрируется сам | участвует в аукционах, делает ставки, ведёт сделки, получает комиссию |
| **Developer** (девелопер) | создаётся админом ИЛИ регистрируется сам (есть оба пути) | выставляет объекты, создаёт аукционы, подтверждает результат и сделку, платит платформе |
| **Admin** (админ) | superuser / `is_staff` | модерирует объекты, верифицирует пользователей, проверяет документы сделок, фиксирует выплаты |

### Схема верхнего уровня

```
┌─────────────────────────────┐          ┌──────────────────────────────────────────┐
│   Frontend (Next.js 16)     │          │            Backend (Django 5)             │
│                             │          │                                            │
│  App Router / FSD           │  REST    │  DRF ViewSets / APIView   ─┐               │
│  axios + react-query        │ ───────► │  api/v1/…                  │               │
│  zustand (persist) сессия   │ ◄─────── │  JWT (SimpleJWT)           │               │
│                             │  JSON    │                            ▼               │
│  WebSocket клиент           │          │  PostgreSQL 16 ◄── ORM ── бизнес-логика    │
│   - живой open-аукцион      │  WS      │       ▲                     │               │
│   - sealed-bids владельцу   │ ◄──────► │  Channels (ASGI/uvicorn)   │               │
│   - notifications           │          │   consumers + JwtAuth MW   │               │
│                             │          │       │                     ▼               │
└─────────────────────────────┘          │  Redis ◄── channel layer / cache / broker  │
                                          │       ▲                     │               │
                                          │  Celery worker + beat ──────┘               │
                                          │   (статусы аукционов, дедлайны, рассылки)   │
                                          └──────────────────────────────────────────┘
```

Redis выполняет **три роли** (разные DB-индексы): channel layer для WebSocket
(`CHANNEL_REDIS_URL`), кэш / OTP-коды (`CACHE_REDIS_URL`), брокер и backend
результатов Celery (`CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND`).

### Ключевые архитектурные решения

- **Уведомления — не через Django signals, а явными вызовами** `notify_*` из
  `views`/`services`/`tasks` в чёткий момент бизнес-перехода. Сначала запись в БД,
  затем `transaction.on_commit()` → WebSocket broadcast (см. раздел 9).
- **Статусы аукционов переключает Celery** через one-off задачи
  `django_celery_beat.ClockedSchedule` + fallback-свипер каждые 5 мин.
- **Файлы шифруются на диске** (AES-256-GCM, envelope-encryption,
  `helpers/encrypted_storage.py`). Прямой `/media/` отдаёт шифртекст; скачивание —
  только через auth-gated подписанные URL `…/api/v1/files/…`.
- **PII-поля шифруются на уровне поля** (`EncryptedCharField` — телефоны брокера/
  девелопера).

---

## 2. Стек и инфраструктура

### Фронтенд

| Технология | Версия / примечание |
|-----------|---------------------|
| Next.js | 16.1.6, App Router, Turbopack, `output: 'standalone'` |
| React | 19.2 |
| TypeScript | 5.x |
| Tailwind CSS | v4 (`@tailwindcss/postcss`) |
| HTTP | `axios` ^1.13 (единый instance с интерсептором) |
| Серверный стейт | `@tanstack/react-query` ^5.90 |
| Клиентский стейт | `zustand` ^5 (сессия, persist в localStorage); локально также `jotai` |
| Формы | `react-hook-form` + `zod` (`@hookform/resolvers`) |
| UI-примитивы | Radix UI, `react-aria-components`, иконки HugeIcons/Remix, графики `recharts`, анимации `framer-motion` |
| Прочее | `libphonenumber-js`, `react-otp-input`, `react-day-picker`, `react-hot-toast` |

Архитектура — **FSD** (Feature-Sliced Design), слои `shared / entities / features / widgets / app`. Алиас путей `@/*` → `./src/*`.

> **Дизайн-система — строгие правила.** Чистый SaaS-dashboard стиль (Notion/Linear/
> Vercel). Полный маппинг Tailwind-классов (фоны, текст, бордеры, радиусы, тени,
> бейджи статусов, кнопки, инпуты, таблицы, сайдбар) задан в
> `mig-tender-front/CLAUDE.md`. При правке любого компонента классы переписываются
> под систему целиком, старые стили не сохраняются.

### Бэкенд

| Технология | Версия / примечание |
|-----------|---------------------|
| Python | 3.13 (Docker), Django 5.2.10 |
| API | DRF 3.16, `drf-spectacular` (OpenAPI/Swagger) |
| Auth | `djangorestframework-simplejwt` 5.5 (HS256) |
| БД | PostgreSQL 16 (`psycopg2-binary`) |
| Realtime | `channels` 4.3 + `channels_redis`, ASGI через `uvicorn[standard]` |
| Очереди | `celery` 5.6 + `django-celery-beat` (DatabaseScheduler) |
| Кэш | `django-redis` |
| Фильтры | `django-filter` |
| CORS | `django-cors-headers` |
| Шифрование | `cryptography` (envelope-encryption файлов и PII-полей) |

Settings разбиты на модули `migtender/settings/{base,dev,prod,test}.py`. Выбор через
`DJANGO_SETTINGS_MODULE` (по умолчанию `migtender.settings` → `__init__.py` решает,
какой профиль грузить).

### CI/CD и деплой

Деплой настроен **двумя независимыми способами** в каждом репозитории (на момент
написания активны оба — это следствие миграции инфраструктуры; уточнить, какой
актуален):

**1. GitHub Actions** (`.github/workflows/deploy.yml`) — деплой по SSH на push в `main`:

- *Фронт*: `git reset --hard origin/main` → `npm i` → `rm -rf .next` (обязательно,
  иначе Next.js переиспользует старые чанки) → `npm run build` →
  `pm2 restart mig-tender-front-3007` → `pm2 save`. Запускается через PM2
  (`ecosystem.config.js`, `npm run start` на порту 3007).
- *Бэк*: `git reset --hard origin/main` → `pip install -r requirements.txt` →
  `migrate --noinput` → `collectstatic --noinput` → `systemctl restart migtender
  celery-worker celery-beat` → `nginx -t && systemctl reload nginx`.
  То есть прод-бэк через **systemd-юниты**, не Docker.

**2. GitLab CI** (`.gitlab-ci.yml`) — на push в `main` вызывает на хосте
`migtender-deploy {frontend|backend}` (GitLab Runner крутится прямо на сервере
`178.72.129.232` как root с shell-executor'ом). Этот скрипт делает
`git pull --ff-only` + `docker compose up -d --build`. То есть GitLab-путь —
**Docker Compose**.

**Docker** (альтернативный/новый путь развёртывания):

- Фронт: multi-stage `Dockerfile` (deps → builder → runner), `output: standalone`,
  финальный образ ~150 МБ, слушает `127.0.0.1:3000`, nginx на хосте проксирует.
  `NEXT_PUBLIC_*` инлайнятся в бандл на этапе **build** (через build args в
  `docker-compose.yml`).
- Бэк: один образ, разные процессы — `web` (uvicorn ASGI, HTTP+WS),
  `celery-worker`, `celery-beat`, плюс `postgres:16-alpine` и `redis:7-alpine`.
  `web` при старте сам прогоняет `migrate` + `collectstatic`. Слушает
  `127.0.0.1:8000`.

### Переменные окружения

**Фронт** (`.env.example`, инлайнятся в клиентский бандл при сборке):

| Переменная | Назначение |
|-----------|-----------|
| `NEXT_PUBLIC_API_URL` | база API, напр. `https://backend.migntender.app/api/v1` |
| `NEXT_PUBLIC_DADATA_TOKEN` | токен DaData (адреса/подсказки) |

**Бэк** (`.env.example`):

| Переменная | Назначение |
|-----------|-----------|
| `DJANGO_SETTINGS` | профиль (`prod`/`dev`) |
| `SECRET_KEY` | секрет Django |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` / `DEFAULT_FROM_EMAIL` | SMTP |
| `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` | Celery (Redis) |
| `CHANNEL_REDIS_URL` | channel layer для WebSocket |
| `CACHE_REDIS_URL` | кэш / OTP-коды |
| `FILE_ENCRYPTION_KEY` | мастер-ключ шифрования файлов и PII (base64 32 байта). **При потере ключа все зашифрованные данные нечитаемы** — бэкапить вместе с `.env`. Если не задан — генерируется и пишется в `<BASE_DIR>/.file_encryption_key` (mode 0600, в `.gitignore`) |
| `DOWNLOAD_TOKEN_SIGNING_KEY` / `DOWNLOAD_TOKEN_TTL_SECONDS` | подпись и TTL (по умолчанию 600 с) коротких ссылок на скачивание |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` (`DB_HOST`/`DB_PORT` переопределяет compose) | PostgreSQL |
| `STATIC_ROOT` / `MEDIA_ROOT` | пути статики/медиа |

Бизнес-константы зашиты в `settings/base.py` (не env): `PLATFORM_COMMISSION_RATE =
0.40` %, `DEAL_DOCUMENT_DEADLINE_DAYS = 7`, `DEAL_PENDING_DOCUMENTS_FAIL_DAYS = 5`,
`SETTLEMENT_BROKER_PAYOUT_DAYS = 3`, `SETTLEMENT_DEVELOPER_PAYMENT_DAYS = 180`,
`NOTIFICATION_DEVELOPER_CONFIRM_REMINDER_DAYS = 3`.

> **Легаси/важно:** в `settings/base.py` тайминги аукциона временно отключены
> (`AUCTION_MIN_START_OFFSET=0`, `AUCTION_MIN_DURATION=0`, `AUCTION_MAX_DURATION=3650
> дней`). Оригинальные значения (старт ≥ +1 ч, длительность 12 ч…30 дней) закомменчены
> в коде — при возврате ограничений вернуть их там.

---

## 3. Структура репозиториев

### Фронтенд — слои FSD (`src/`)

Зависимости направлены строго вниз: `app → widgets → features → entities → shared`.

| Слой | Содержимое | Примеры |
|------|-----------|---------|
| **`app/`** | Next.js App Router. Группы маршрутов `(auth)` и `(main)`. Страницы, лейауты | `(auth)/login`, `(auth)/register`, `(auth)/forgot-password`; `(main)/dashboard`, `/auctions`, `/auctions/[id]`, `/auctions/create`, `/properties`, `/properties/[id]`, `/properties/create`, `/objects`, `/deals`, `/payments`, `/documents`, `/cabinet`, `/admin/users`, `/admin/users/new-developer`, `/admin/properties` |
| **`widgets/`** | Крупные самостоятельные UI-блоки. **Внимание:** на момент написания тут остались дашборд-виджеты из стартового шаблона (`widget-budget-overview`, `widget-credit-score`, `widget-exchange`, `widget-my-cards` …) — финтех-демо, **легаси/не доменное**. Уточнить, что используется |
| **`features/`** | Пользовательские сценарии: react-query мутации/хуки. По доменам: `auth`, `auctions`, `admin`, `deals`, `document-requests`, `payments`, `properties` | `features/auth/model/queries.ts`, `features/admin/model/queries.ts` (`useAdminCreateDeveloper`…), `features/auctions/model/queries.ts` |
| **`entities/`** | Доменные сущности: API-сервисы и сторы. `admin`, `auctions`, `auth`, `deals`, `document-requests`, `notifications`, `payments`, `properties` | `entities/auth/model/store.ts` (zustand сессия), `entities/notifications/model/store.ts`, `entities/*/api/*.service.ts` |
| **`shared/`** | Переиспользуемое без доменной логики: `api/` (axios instance), `types/` (типы по доменам), `lib/` (утилиты: `validations.ts`, `phone.ts`, `inn.ts`, `formatters.ts`, `design-tokens.ts`, `notification-route.ts`, `translate-backend-error.ts`, `fetch-file.ts`…), `hooks/`, `ui/`, `components/` | `shared/api/instance.ts`, `shared/types/auth.ts` |

`src/proxy.ts` — Next.js middleware (название `proxy`, экспорт default + `config.matcher`).
Гард по cookie `has_session`: неавторизованных редиректит на `/register`, авторизованных
с auth-страниц — на `/dashboard`. **Это UX-гард, не безопасность** — реальную защиту
даёт JWT на бэке.

### Бэкенд — Django-аппы (`apps/`)

Каталог `apps/` добавлен в `sys.path`, поэтому импорты идут как `users`, `auctions`
и т.п. (без префикса `apps.`), кроме `admins` (исторически `apps.admins`).

| Апп | Назначение | Ключевые файлы |
|-----|-----------|----------------|
| **`users`** | Кастомный `User` (email-логин), профили `Broker`/`Developer`, `UserDocument`. Регистрация, OTP-верификация email, login/refresh, смена пароля, reset пароля, профиль `/me/`, документы, auth-gated скачивание файлов | `models.py`, `serializers.py`, `views.py`, `utils.py` (OTP, rate-limit), `files_urls.py` |
| **`admins`** | Админ-эндпоинты: список/блокировка/правка пользователей, создание/правка девелопера, верификация брокера, модерация объектов | `views.py`, `serializers.py`, `permissions.py`, `filters.py` |
| **`properties`** | Объекты недвижимости (`Property`, `PropertyImage`), фильтры, совместимость для лотов, видимость цены брокерам | `models.py`, `serializers.py`, `views.py`, `services/compatibility.py` |
| **`auctions`** | `Auction`, `AuctionProperty`, `Bid`, `DocumentRequest(+File)`. Жизненный цикл, ставки (open через WS, closed через HTTP), решение владельца, запросы документов. WebSocket-консьюмеры | `models.py`, `serializers.py`, `views/`, `services/`, `tasks.py`, `consumers.py`, `realtime.py`, `routing.py` |
| **`deals`** | `Deal`, `DealLog`. Жизненный цикл сделки, загрузка ДДУ/оплаты, проверка админом, подтверждение девелопером, авто-fail по дедлайнам | `models.py`, `services.py`, `views.py`, `tasks.py` |
| **`payments`** | `Payment` (легаси-выплаты) и `DealSettlement` (транзитный расчёт платформа↔брокер↔девелопер) | `models.py`, `serializers.py`, `views.py`, `tasks.py` |
| **`notifications`** | `Notification`, единый сервис `notify_*`, realtime через персональный канал пользователя, REST list/read, Celery-напоминания | `models.py`, `services.py` (~46 КБ), `consumers.py`, `tasks.py`, `realtime.py` |

Проектный пакет `migtender/`: `settings/`, `urls.py`, `asgi.py` (ASGI + WS-роутинг),
`celery.py` (+ `beat_schedule`), `middleware.py` (`JwtAuthMiddleware` для WS),
`tasks.py` (cleanup beat-задач), `views.py` (`HealthCheckView`). Каталог `core/` —
`RequestIdMiddleware`, логирование с request_id. Каталог `helpers/` — шифрование
файлов и полей.

---

## 4. Аутентификация и роли

### JWT (SimpleJWT)

- Алгоритм HS256. **Prod:** access = 15 мин, refresh = 7 дней. **Dev:** access = 1
  день, refresh = 30 дней.
- **Ротация refresh отключена** (`ROTATE_REFRESH_TOKENS=False`). Один refresh
  валиден все 7 дней. Сделано осознанно: при ротации параллельные `/refresh/` из
  нескольких вкладок могли бы гонкой выкинуть юзера из сессии.
- Дефолтный permission-класс — `apps.admins.permissions.IsActiveUser` (любой
  активный пользователь), эндпоинты сужают доступ своими `permission_classes`.

**Эндпоинты:** `POST /api/v1/auth/login/` → `{access, refresh, user}`,
`POST /api/v1/auth/refresh/` → `{access}` (refresh **не** возвращается из-за
выключенной ротации).

**Интерсептор обновления токена** (`src/shared/api/instance.ts`):

- Request-интерсептор подставляет `Authorization: Bearer <accessToken>` из zustand-стора.
- Response-интерсептор: на `401` (кроме `/auth/refresh/`, `/auth/login/` и
  повторных запросов с флагом `_retry`) запускает refresh. Параллельные 401
  ставятся в очередь `failedQueue` и допроигрываются после успешного refresh —
  то есть refresh выполняется один раз, остальные ждут новый токен.
- **Важный нюанс (баг «случайный логаут»):** ответ refresh содержит только
  `{access}`. Стор обновляется как `setTokens(data.access, data.refresh ?? refreshToken)`
  — без fallback'а старый refresh затирался бы `undefined` и следующий 401 выкидывал
  бы пользователя.
- При отсутствии refresh или провале refresh — `logout()` + редирект на `/register`.

**Сессия на фронте** (`src/entities/auth/model/store.ts`): zustand + `persist`
(`session-storage` в localStorage). Хранит `accessToken`, `refreshToken`, `user`,
`isAuthenticated`. Дополнительно ставит cookie `has_session` (для middleware-гарда
`proxy.ts`). Хелперы ролей `isUserAdmin/Developer/Broker` проверяют и поле `role`
(из login), и флаги `is_*` (из `/auth/me/`).

### Роли и их хранение

`User.Roles` (`users/models.py`): `developer` | `broker` | `admin`. Поле `role`
+ свойства `is_developer/is_broker/is_admin`. Админ — это `is_staff`/`is_superuser`
с `role=admin` (создаётся через `createsuperuser`). Сохранение профиля `Broker`/
`Developer` принудительно проставляет соответствующий `user.role`.

### Регистрация

Существует **два флоу** (есть оба):

1. **Новый, упрощённый** (ТЗ 2026-05-14): `POST /api/v1/auth/register/`
   (`SimpleRegisterView`) — единая 3-шаговая форма: email → OTP → данные
   (`email, first_name, phone_number, password, password_confirm, role?,
   offer_accepted, obligation_accepted`). На шаге «данные» email уже должен быть
   подтверждён OTP. `role` опционален (дефолт `broker`).
2. **Легаси** (multi-step с полным набором полей): `POST /api/v1/auth/register/broker/`
   (`RegisterBrokerView`) — `inn_number, phone_number, inn (файл), passport (файл),
   auction_obligation_accepted`. Фронт постепенно отказывается.

> **Девелопер.** По `CLAUDE.md` девелоперов создаёт **только админ** (`/admin/users`
> → «Добавить девелопера»), публичный `/register/developer` удалён. При этом в коде
> `Developer` имеет собственный verification-флоу (ТЗ 2026-05-14 ввело и
> самостоятельную регистрацию девелопера). То есть **в коде живут оба пути** (Path A
> — self-register, Path B — админ). Расхождение фронт↔бэк — уточнить, какой путь
> канонический.

### Верификация email по коду (OTP)

Эндпоинты (`AllowAny`): `POST /auth/get-code/`, `POST /auth/verify-email/`,
`POST /auth/resend-code/`.

Механика (`users/utils.py`): код длиной `EMAIL_VERIFICATION_CODE_LENGTH=6`, живёт
в кэше (Redis) `EMAIL_VERIFICATION_CODE_EXPIRY=15 мин`. После успешного
`/verify-email/` в кэш ставится флаг `is_email_verified_for_registration(email)`.
Сериализаторы регистрации и смены email **требуют этот флаг** прежде чем принять
email. Есть rate-limit (`EmailRateLimiter`, `EMAIL_SEND_LIMIT=60 c` по IP+email) и
`LoginAttemptLimiter` (блокировка после серии неудачных логинов).

### Смена email с кодом

`PATCH /api/v1/auth/me/` (`UserProfileUpdateSerializer`): если новый `email`
отличается от текущего — он принимается **только если** для него уже выставлен флаг
`is_email_verified_for_registration` (то есть пользователь прошёл `/get-code/` +
`/verify-email/` для нового адреса). Иначе — ошибка `email_not_verified`. Для
**админ-апдейта** проверка не требуется (админ доверенный, не может получить чужой
OTP). Старому адресу шлётся уведомление о смене (`send_email_changed_notice_to_old`).

### Сброс пароля (forgot password)

`POST /auth/password-reset/request/` → `/verify/` → `/confirm/` — отдельный OTP-код
в кэше (`get_password_reset_code_key`), своя проверка `verify_password_reset_code` и
флаг `mark_email_verified_for_password_reset`. Смена пароля под сессией —
`POST /auth/change-password/`.

### Статусы верификации профиля

**Брокер** (`Broker.VerificationStatuses`):

| Статус | UI | Когда |
|--------|-----|-------|
| `not_submitted` | «Не верифицирован» | после упрощённой регистрации (профиль не заполнен) **или** после reject админом (с `rejection_reason`) |
| `in_review` | «На проверке» | брокер нажал «Отправить на проверку» |
| `accepted` | «Верифицирован» | админ подтвердил |
| `pending` *(legacy)* | «На проверке» | старый дефолт; существующие prod-брокеры |
| `rejected` *(legacy)* | — | больше не используется (reject возвращает в `not_submitted`) |

**Девелопер** (`Developer.VerificationStatuses`): `not_submitted` | `in_review` |
`accepted` (без legacy-значений). Зеркалит флоу брокера.

Переходы (методы модели): `submit_for_review()` → `in_review` (идемпотентно,
сбрасывает прошлый reject); `verify_broker()`/`verify_developer()` → `accepted`
(+`is_verified=True`, `verified_at`); `set_as_rejected(reason)` → `not_submitted`
(+`rejection_reason`, `rejected_at`). У `Broker`/`Developer` поле `updated_at`
бампается на **любом** save (для сортировки «последняя активность» в админке).

### Отправка профиля на проверку

`POST /api/v1/auth/submit-for-review/` (`SubmitProfileForReviewView`) — проверяет
полноту профиля **перед** переводом в `in_review`:

- **Брокер:** `first_name`, `last_name`, `inn_number`, `phone_number` + загруженные
  документы `inn` и `passport`.
- **Девелопер:** `first_name`, `last_name`, `company_name`, `phone_number`,
  `inn_number` + (ТЗ 2026-05-15) документы `inn` и `passport`.

Если чего-то нет — `400 {detail, missing_fields:[…]}`. После успеха —
`notify_verification_submitted`.

### Документы пользователя (ИНН/паспорт)

Модель `UserDocument` (`doc_type`: `inn` | `passport` | `others`). Партиал-уникальность:
один `inn` и один `passport` на пользователя (constraint
`uniq_user_single_primary_doc_type`). Админ загружать документы не может (`clean()`).
Файлы шифруются; при удалении записи удаляется и файл из storage.

### Верификация админом

`POST /api/v1/admin/broker/verify/` (`BrokerVerificationView`, `IsAdminUser`): тело
`{id, action: "accept"|"reject"}`. `accept` → `verify_broker()`; `reject` →
`set_as_rejected(reason)`. (Эндпоинт назван «broker», но логика работает и через
общий профиль — уточнить покрытие девелопера в `serializers.py`.)

> **Известный пробел (из `CLAUDE.md`, проверено эмпирически 2026-04-14):**
> админские create/update девелопера **не сохраняют** `inn_number`, `phone_number`
> и не создают `UserDocument(inn/passport)`. `POST /admin/developers/` с multipart
> молча игнорирует эти поля (201), `PATCH` с только ними → `400`. Для поддержки
> нужно расширить `DeveloperProfile` и сериализаторы + обработку файлов в
> admin-контексте.

---

## 5. Доменные модели

Все денежные поля — `DecimalField(max_digits=14, decimal_places=2)` (ставки/проценты
— `max_digits=5, decimal_places=2`). Ниже — основные поля, связи, enum'ы и инварианты.

### 5.1. Property (`properties/models.py`)

Объект недвижимости.

| Поле | Тип | Примечание |
|------|-----|-----------|
| `reference_id` | UUID | публичный неизменяемый id |
| `owner` | FK User (`PROTECT`) | девелопер-владелец |
| `type` | enum `PropertyTypes` | `apartment, house, townhouse, commercial, land` |
| `address` | str | |
| `project` / `project_comment` | str / text | |
| `rooms`, `floor`, `area` | число / число / Decimal | `area > 0` (constraint) |
| `purpose`, `commercial_subtype` | str / enum | `CommercialSubtypes`: `retail, office` (legacy `warehouse/other` схлопнуты миграцией) |
| `property_class` | enum `PropertyClasses` | `economy, comfort, business, premium` (+ legacy `elite`, не выбирается в форме) |
| `price` | Decimal | прайсовая цена, `price ≥ 0` |
| `commission_rate` | Decimal % nullable | индивидуальная ставка комиссии для брокера по объекту |
| `deadline`, `delivery_date` | date | |
| `developer_name` | str | |
| `land_number`, `house_number` | str | |
| `show_price_to_brokers` | bool (default True) | скрывать ли прайсовую цену от брокеров |
| `status` | enum `PropertyStatuses` | `draft, published, archived, sold` |
| `moderation_status` | enum `ModerationStatuses` | `pending, approved, rejected` |
| `moderation_rejection_reason` | str | |

**Инвариант:** `land` — без `property_class`; не-`land` — `property_class`
обязателен (CheckConstraint `prop_land_property_class_rule`). Методы
`approve_moderation()` / `reject_moderation(reason)`.

`PropertyImage`: `image` (зашифрованный файл) **или** `external_url`; `sort_order`
(уникален в рамках объекта), `is_primary` (не более одного primary на объект).

### 5.2. Auction (`auctions/models.py`)

| Поле | Тип | Примечание |
|------|-----|-----------|
| `mode` | enum `Mode` | `open` \| `closed` |
| `real_property` | FK Property nullable | **только OPEN** (один объект); для CLOSED — null |
| `properties` | M2M через `AuctionProperty` | лот (CLOSED — N объектов; может зеркалить OPEN) |
| `owner` | FK User | девелопер |
| `min_price` | Decimal | мин. сумма ставки **за весь лот** |
| `min_bid_increment` | Decimal nullable | шаг повышения, **только OPEN** (≥1) |
| `commission_rate` | Decimal % nullable | **единая ставка для всего лота** (правило «один пул — одна комиссия») |
| `show_price_to_brokers` | bool | |
| `start_date` / `end_date` | datetime nullable | у draft могут быть null |
| `status` | enum `Status` | `draft, scheduled, active, finished, cancelled, failed` |
| `bids_count`, `current_price`, `highest_bid` | агрегаты | пересчитываются при ставке |
| `winner_bid` | FK Bid nullable | победитель |
| `shortlisted_bids` | M2M Bid | для CLOSED — выбранный победитель |
| `declined_bids` | M2M Bid | ставки, от которых владелец отказался (исключаются при поиске следующего кандидата, ТЗ 8.5) |
| `owner_decision` | enum `OwnerDecision` | `pending, confirmed, rejected` |
| `owner_rejection_reason`, `owner_decided_at` | text / datetime | |

**Инварианты (CheckConstraints):**
- `end_date > start_date` (если оба заданы).
- Для не-draft: OPEN ⇒ `min_bid_increment` задан (≥1) **и** `real_property` задан;
  CLOSED ⇒ `min_bid_increment` null. (`clean()` дополнительно зануляет
  `min_bid_increment`/`real_property` для CLOSED.)

Свойства: `is_active_now`, `lot_total_price` (Σ `properties.price`),
`get_single_property()`.

`AuctionProperty` — связь лот↔объект (уникальная пара `auction+property`).

### 5.3. Bid (`auctions/models.py`)

| Поле | Тип | Примечание |
|------|-----|-----------|
| `auction` | FK Auction | |
| `broker` | FK User | |
| `amount` | Decimal | `> 0` |
| `is_sealed` | bool | `True` — ставка закрытого аукциона |
| `created_at` | datetime | |
| `amount_updated_at` | datetime | **отдельный** таймстамп изменения суммы (для tie-break) |

**Инварианты:** одна **open**-ставка на брокера на аукцион **и** одна **sealed**-ставка
на брокера на аукцион (два партиал-unique constraint по `is_sealed`).

> **Tie-break (ТЗ 2026-05-15):** при равных суммах в закрытом аукционе побеждает тот,
> кто **раньше дошёл** до этой суммы — сортировка `-amount, amount_updated_at`. Раньше
> использовался `created_at`, из-за чего меняющий ставку игрок «крал» победу.

`DocumentRequest` / `DocumentRequestFile` — запрос документов у брокера в рамках
аукциона: `status` (`pending, answered, cancelled`), `description`, `broker_comment`,
`requested_by`, ответные файлы.

### 5.4. Deal (`deals/models.py`)

| Поле | Тип | Примечание |
|------|-----|-----------|
| `auction` | FK Auction | |
| `bid` | FK Bid | одна ставка → может породить несколько сделок (split лота) |
| `broker` / `developer` | FK User | |
| `real_property` | FK Property | **legacy** primary-объект (читалки пока ходят сюда) |
| `properties` | M2M Property | все объекты обязательства брокера (OPEN — 1; CLOSED — весь лот или подмножество) |
| `amount` | Decimal | **= `bid.amount` всегда** (брокер платит свою ставку) |
| `lot_bid_amount` | Decimal nullable | исходная ставка по лоту |
| `status` | enum `Status` | `pending_documents, admin_review, developer_confirm, confirmed, failed, declined` |
| `obligation_status` | enum `ObligationStatus` | `active, fulfilled, overdue` |
| `ddu_document`, `payment_proof_document` | File | ДДУ и подтверждение оплаты |
| `broker_comment`, `admin_rejection_reason`, `developer_rejection_reason` | text | |
| `document_deadline` | datetime | `auction.end_date + DEAL_DOCUMENT_DEADLINE_DAYS (7)` |

**Свойство `commission_rate`** (правило «один пул — одна комиссия», ТЗ 2026-05-19/20):
- Лот из **одного** объекта (OPEN или CLOSED single) → ставка **всегда** с объекта
  (`Property.commission_rate`), даже если в `Auction.commission_rate` что-то лежит
  (защита от устаревших/бэкфилленных значений).
- Лот из **2+** объектов → единая `Auction.commission_rate`.
- Если нигде нет — `0.00` (расчёт не падает).

**Инварианты:** `amount > 0`; уникальность пары `auction+real_property`; **уникальность
пары `auction+broker`** (один брокер — максимум одна сделка в аукционе, даже при
нескольких объектах).

`DealLog` — аудит-лог переходов сделки (`Action`: `created, ddu_uploaded,
payment_proof_uploaded, comment_added, submitted_for_review, admin_approved,
admin_rejected, developer_confirmed, developer_rejected, marked_overdue,
marked_failed, marked_declined`).

### 5.5. Payment и DealSettlement (`payments/models.py`)

**`Payment`** *(легаси-модель выплат)*: `type` (`developer_commission` |
`platform_commission`), `amount`, `rate`, `status` (`pending` | `paid`),
`receipt_document`. Уникальность пары `deal+type`.

> На текущем флоу основной расчёт делается через **`DealSettlement`** (см. ниже).
> `create_payments_for_deal()` — тонкий прокси к `create_settlement_for_deal()`.

**`DealSettlement`** — транзитный расчёт по сделке (OneToOne к `Deal`). Snapshot
сумм на момент создания:

| Поле | Назначение |
|------|-----------|
| `broker_amount` / `broker_rate` | к выплате брокеру = `deal.amount × broker_rate%` |
| `platform_amount` / `platform_rate` | комиссия платформы = `deal.amount × 0.4%` |
| `total_from_developer` | долг девелопера = `broker_amount + platform_amount` |
| `paid_to_broker` (+`_at`, `broker_payout_receipt`, `broker_payout_deadline`) | этап 1: платформа → брокеру (дедлайн +3 дня) |
| `received_from_developer` (+`_at`, `developer_receipt`, `developer_receipt_uploaded_at`, `developer_receipt_rejection_reason`, `developer_payment_deadline`) | этап 2: девелопер → платформе (дедлайн +180 дней / 6 мес) |

Свойства: `is_financially_closed` (оба флага True), `broker_payout_overdue`,
`developer_payment_overdue`.

### 5.6. User / Broker / Developer / UserDocument

См. раздел 4. Кратко: `User` (email-логин, `role`, `inn_number` уникальный),
`Broker` (телефон-шифр, verification-флоу, obligation-accept метаданные),
`Developer` (`company_name`, `ddu_template`, verification-флоу), `UserDocument`
(`inn/passport/others`, шифрованные файлы).

### 5.7. Notification (`notifications/models.py`)

| Поле | Назначение |
|------|-----------|
| `user` | владелец уведомления |
| `category` | enum: `system, user, property, auction, deal, payment` |
| `event_type` | конкретный тип события (фронт опирается на него для логики/навигации) |
| `title` / `message` | заголовок (часто пустой) / готовый текст для UI |
| `data` | JSON-payload (id'шники для перехода) |
| `auction`/`deal`/`payment`/`real_property` | FK на предмет уведомления |
| `dedupe_key` | unique, защита от дублей cron/reminder |
| `is_read`, `read_at`, `created_at` | состояние |

Метод `mark_as_read()`. Подробности — раздел 9.

---

## 6. Бизнес-логика и флоу

### 6.1. Жизненный цикл аукциона

```
                    publish (owner, draft→scheduled)
   ┌────────┐  ─────────────────────────────►  ┌───────────┐
   │ DRAFT  │                                   │ SCHEDULED │
   └────────┘                                   └─────┬─────┘
       │ cancel                          activate_auction (Celery, start_date)
       │ (owner/admin)                                │
       ▼                                              ▼
  ┌───────────┐                                  ┌────────┐
  │ CANCELLED │                                  │ ACTIVE │
  └───────────┘                                  └───┬────┘
                              finish_auction (Celery, end_date)
                       ┌──────────────────────────┴───────────────────┐
              нет ставок                                          есть ставки
                   ▼                                                  ▼
              ┌────────┐                                        ┌──────────┐
              │ FAILED │                                        │ FINISHED │
              └────────┘                                        └────┬─────┘
                                              owner_decision: confirm / reject / decline
                                ┌──────────────────┼───────────────────────┐
                          confirm                reject               decline (отказ от победителя)
                             ▼                      ▼                        ▼
                   создаётся Deal,           status=FAILED         следующий кандидат → новый winner
                   owner_decision=CONFIRMED  owner_decision=        (pending) ИЛИ, если кандидатов
                                             REJECTED               нет → status=FAILED
```

**Создание и публикация.** Аукцион можно создать сразу или сохранить как `draft`
(поля необязательны). `POST /auctions/{id}/publish/` (`AuctionPublishView`,
владелец/админ) промоутит draft → `scheduled`: можно прислать переопределения
(`start_date, end_date, mode, min_bid_increment, propertyIds, …`), недостающее
берётся из draft. На публикации идёт **строгая** валидация (зеркало не-draft ветки
create): объекты должны быть `approved` + `published`, принадлежать тому же
девелоперу и быть свободны от блокирующих аукционов
(`BLOCKING_AUCTION_STATUSES`); OPEN ⇒ ровно 1 объект и задан шаг. После сохранения
через `transaction.on_commit` регистрируются Celery-задачи переключения статусов и
broadcast статуса.

**Планирование статусов через Celery** (`auctions/tasks.py`):
`schedule_auction_status_tasks` создаёт две one-off `PeriodicTask` на
`ClockedSchedule`: `activate_auction(start_date)` (scheduled→active; если end уже
прошёл — сразу finished) и `finish_auction(end_date)`. Обе под `select_for_update`.
Fallback — `sweep_overdue_auctions` каждые 5 мин (на случай рестарта воркера/
потери ClockedSchedule). `cancel_auction_status_tasks` снимает их при отмене.

**Open vs Closed:**

| | OPEN | CLOSED (sealed-bid) |
|---|------|---------------------|
| Объектов в лоте | ровно 1 | 1..N |
| Ставки | через **WebSocket**, видны всем в комнате | через **HTTP**, видны только владельцу/админу |
| Правило суммы | первая ≥ `min_price`; далее ≥ `current_price + min_bid_increment`; одна open-ставка на брокера (обновляется) | ≥ `min_price`; одна sealed-ставка на брокера (можно править/удалять, пока активен) |
| Победитель при finish | `highest_bid` автоматически | `auto_select_closed_winner` (макс `amount`, tie-break по `amount_updated_at`) |

**Решение владельца после FINISHED** (`auctions/services/`):
- **confirm** (`confirm_auction_result`): требует winner; создаёт **одну** сделку с
  набором объектов лота (`create_deal_from_bid`); `owner_decision=confirmed`. Для
  CLOSED шлёт «не выбран» остальным участникам.
- **reject** (`reject_auction_result`): `owner_decision=rejected`, `status=FAILED`.
- **decline** (`decline_auction_result`, ТЗ 8.5): отказ от текущего победителя.
  Текущий winner уходит в `declined_bids`, активные сделки по нему (только в
  `pending_documents`) → `declined`. Ищется **следующий кандидат** (исключая
  declined; для CLOSED — в рамках shortlist). Если есть → он новый winner,
  `owner_decision=pending` (нужно решение снова). Если нет → `status=FAILED`.

> **Легаси:** ручной выбор победителя CLOSED (`select_closed_auction_winner`,
> endpoints `/shortlist/`, `/select-winner/`) и распределение лота между несколькими
> брокерами (`distribute-lot`) — **deprecated** после ТЗ 2026-05-14. Лот не делится,
> победитель один, выбирается автоматически. Эндпоинты оставлены для совместимости.
> Но `Deal` всё ещё поддерживает M2M `properties` и multi-winner-математику на
> случай возврата распределения.

### 6.2. Жизненный цикл сделки

```
   создаётся при confirm результата (broker = winner)
            │
            ▼
   ┌───────────────────┐  broker: upload ДДУ + оплату, submit-for-review
   │ PENDING_DOCUMENTS │ ───────────────────────────────────────────┐
   └───────┬───────────┘                                             ▼
           │                                              ┌──────────────┐
           │ авто-fail: нет доков                          │ ADMIN_REVIEW │
           │ > 5 дней (Celery)                            └──────┬───────┘
           │ ИЛИ дедлайн истёк → obligation OVERDUE        admin: approve / reject
           ▼                                          ┌──────────┴────────┐
       ┌────────┐                                 approve              reject (reason)
       │ FAILED │ ◄─── (decline результата:          ▼                    │
       └────────┘      из pending → DECLINED)  ┌───────────────────┐      │
                                               │ DEVELOPER_CONFIRM │      │
                                               └─────────┬─────────┘      │
                                          developer: confirm / reject     │
                                       ┌──────────────┴──────────┐        │
                                   confirm                   reject(reason)│
                                       ▼                          │        │
                               ┌───────────┐                      ▼        ▼
                               │ CONFIRMED │              back to PENDING_DOCUMENTS
                               └─────┬─────┘
                          objects → SOLD, obligation FULFILLED,
                          создаётся DealSettlement (выплаты)
```

**Создание** (`create_deal_from_bid`): `deal.amount = bid.amount`,
`document_deadline = end_date + 7 дней`, статус `pending_documents`. Шлёт email
брокеру + `notify_broker_auction_won`.

**Загрузка документов** (только в `pending_documents`): `POST .../upload-ddu/`,
`.../upload-payment-proof/`, `PATCH .../comment/`. Каждое пишет `DealLog`.

**Submit на проверку** (`submit_deal_for_review`): требует **оба** документа (ДДУ +
оплата), иначе ошибка → `admin_review`. Шлёт email админам + `notify_deal_submitted_for_review`.

**Проверка админом** (`IsAdminUser`): `admin-approve` → `developer_confirm`
(+`notify_admin_approved`, email девелоперу); `admin-reject` (reason) → назад в
`pending_documents` (+`notify_admin_rejected`).

**Подтверждение девелопером** (только владелец сделки): `developer-confirm` →
`confirmed`, `obligation=fulfilled`, **все** объекты сделки → `sold`, создаётся
`DealSettlement` (+`notify_developer_confirmed`); `developer-reject` (reason) →
назад в `pending_documents`.

**Авто-переходы (Celery, `deals/tasks.py`):**
- `check_overdue_deals` (ежедневно 04:00): `pending_documents` + дедлайн истёк →
  `obligation_status = overdue` (+ лог).
- `mark_failed_pending_deals` (ежедневно 04:15): застрявшие в `pending_documents`
  > `DEAL_PENDING_DOCUMENTS_FAIL_DAYS` (5) дней → `failed` (терминально, переоткрыть
  нельзя — нужен новый аукцион) + `notify_deal_failed`.

`DocumentRequest`: админ/владелец может запросить у брокера доп. документы в рамках
аукциона (`POST /auctions/{id}/request-documents/`), брокер отвечает загрузкой файлов.

### 6.3. Расчёты и комиссии

**Правило «один пул — одна комиссия».** Источник ставки брокера для сделки —
свойство `Deal.commission_rate` (см. 5.4): одиночный лот → ставка объекта; лот 2+
→ единая `Auction.commission_rate`. Это устраняет неоднозначность, когда объекты
лота имели разные `Property.commission_rate` (расходились «Мои сделки» и «Мои
платежи»).

**Создание расчёта** (`create_settlement_for_deal`, при `confirmed`):

```
broker_rate     = Deal.commission_rate              (%)
platform_rate   = PLATFORM_COMMISSION_RATE = 0.40   (%)
broker_amount        = deal.amount × broker_rate / 100
platform_amount      = deal.amount × platform_rate / 100
total_from_developer = broker_amount + platform_amount
```

Два этапа: (1) платформа платит брокеру `broker_amount` в течение **3 дней**
(`SETTLEMENT_BROKER_PAYOUT_DAYS`), админ фиксирует чеком → `paid_to_broker`; (2)
девелопер возвращает платформе `total_from_developer` в течение **180 дней / 6 мес**
(`SETTLEMENT_DEVELOPER_PAYMENT_DAYS`), грузит чек, админ подтверждает →
`received_from_developer`. Оба флага → сделка «финансово закрыта». Дедлайны
контролируют Celery-задачи `payments/tasks.py` (`check_broker_payout_deadlines`,
`check_developer_payment_deadlines` — напоминания за 30/7/1 день и при просрочке).

> **Multi-winner математика (на случай возврата распределения):** `deal.amount`
> всегда = ставке брокера независимо от того, забрал он весь лот или часть.
> Pro-rate комиссии по объектам внутри одной сделки делается в
> `DealListSerializer.get_broker_commission_amount` по `property.price`.

### 6.4. Видимость прайсовой цены брокерам

Управляется флагом `show_price_to_brokers` (на `Property` и на `Auction`).
Для **брокерских** запросов цена маскируется в `None` (сериализаторы
`properties/serializers.py`, `auctions/serializers.py`):

- На странице/листинге аукциона: если `auction.show_price_to_brokers is False` →
  `min_price`, `current_price`, `lot_total_price`, `price` объектов → `None`.
- Для **closed**-аукционов сводка цен брокеру скрывается дополнительно
  (`_hide_closed_summary_for_broker`).
- В листинге объектов: если объект участвует в аукционе с
  `show_price_to_brokers=False` **или** в `closed`-аукционе → `price = None`.

Маскирование — только в read-сериализаторах для роли брокера; владелец/админ видят
цены всегда.

---

## 7. API-справочник

База: `…/api/v1/`. Полная схема — **drf-spectacular**:

- OpenAPI JSON: `GET /api/v1/schema/`
- Swagger UI: `GET /api/v1/docs/`

Health-check: `GET /health/`. Django-admin: `/admin/`.

> Ниже — основные эндпоинты по аппам. «Кто» — типичный доступ; точные permissions
> и тела запросов смотрите в Swagger и сериализаторах.

### Auth (`apps/users/urls.py` → `/auth/`)

| Метод | Путь | Кто | Назначение |
|-------|------|-----|-----------|
| POST | `/auth/login/` | все | JWT login (`{access, refresh, user}`); тело может включать `role` (проверяется) |
| POST | `/auth/refresh/` | все | обновить access |
| POST | `/auth/get-code/` | все | запросить OTP на email |
| POST | `/auth/verify-email/` | все | подтвердить OTP |
| POST | `/auth/resend-code/` | все | переслать OTP |
| POST | `/auth/register/` | все | упрощённая регистрация (broker/developer) |
| POST | `/auth/register/broker/` | все | *legacy* регистрация брокера (с файлами) |
| POST | `/auth/change-password/` | auth | смена пароля |
| POST | `/auth/password-reset/{request,verify,confirm}/` | все | сброс пароля |
| GET/PATCH | `/auth/me/` | auth | профиль (PATCH email требует OTP-флаг) |
| POST | `/auth/submit-for-review/` | auth | отправить профиль на верификацию |
| PUT | `/auth/developer/ddu-template/` | developer | загрузить шаблон ДДУ |
| GET | `/auth/documents/all/` | auth | все документы (user + deal) |
| POST | `/auth/documents/upload/` | auth (не admin) | загрузить документ |
| PATCH | `/auth/documents/update-name/` | auth | переименовать документ |
| DELETE | `/auth/documents/{id}/` | auth | удалить документ |

### Files (`apps/users/files_urls.py` → `/files/`)

Auth-gated скачивание (расшифровка). Все ссылки в API ведут сюда; прямой `/media/`
отдаёт шифртекст. `GET /files/user-document/{id}/`, `/files/deal/{deal_id}/{kind}/`,
`/files/developer/{developer_user_id}/ddu-template/`,
`/files/settlement/{settlement_id}/{kind}/`, `/files/property-image/{image_id}/`,
`/files/document-request/{file_id}/`.

### Admin (`apps/admins/urls.py` → `/admin/`, `IsAdminUser`)

| Метод | Путь | Назначение |
|-------|------|-----------|
| GET | `/admin/users/` | список пользователей (фильтры, пагинация) |
| PATCH | `/admin/users/{pk}/` | правка пользователя |
| PATCH | `/admin/users/{pk}/block/` | блок/разблок (`is_active`) |
| POST | `/admin/developers/` | создать девелопера |
| PATCH | `/admin/developers/{pk}/` | правка девелопера |
| POST | `/admin/broker/verify/` | верификация брокера (`{id, action}`) |
| GET | `/admin/properties/` | все объекты |
| GET | `/admin/properties/pending/` | объекты на модерации |
| POST | `/admin/properties/{pk}/approve/` | одобрить модерацию |
| POST | `/admin/properties/{pk}/reject/` | отклонить (reason) |

### Properties (`apps/properties/urls.py` → `/properties/`)

| Метод | Путь | Назначение |
|-------|------|-----------|
| GET/POST | `/properties/` | список / создание |
| GET | `/properties/compatible/` | объекты, совместимые для лота |
| GET | `/properties/my/` | мои объекты (девелопер) |
| GET | `/properties/my/available/` | мои свободные объекты |
| GET/PATCH/… | `/properties/{pk}/` | деталь / правка |
| DELETE | `/properties/{pk}/delete/` | удалить |
| GET/POST | `/properties/{pk}/images/` | изображения |
| …/PATCH | `/properties/{pk}/images/{image_id}/` | правка изображения |

### Auctions (`apps/auctions/urls.py` → `/auctions/`)

| Метод | Путь | Кто | Назначение |
|-------|------|-----|-----------|
| GET/POST | `/auctions/` | | список / создание (draft или сразу) |
| GET | `/auctions/my/` | owner | мои аукционы |
| GET | `/auctions/participated/` | broker | где участвовал |
| GET | `/auctions/{pk}/` | | деталь |
| POST | `/auctions/{pk}/publish/` | owner/admin | draft → scheduled |
| POST | `/auctions/{pk}/cancel/` | owner/admin | отмена scheduled |
| POST | `/auctions/{pk}/join/` | broker | регистрация на аукционе |
| GET | `/auctions/{pk}/participants/` | | участники |
| POST | `/auctions/{pk}/bid/` | broker | **closed**: создать sealed-ставку |
| PATCH/DELETE | `/auctions/{pk}/bid/update/` | broker | **closed**: изменить/удалить свою ставку |
| GET | `/auctions/{pk}/sealed-bids/` | owner/admin | список закрытых ставок |
| POST | `/auctions/{pk}/shortlist/` | owner/admin | *legacy* шортлист |
| POST | `/auctions/{pk}/select-winner/` | owner/admin | *legacy* ручной выбор |
| POST | `/auctions/{pk}/confirm-result/` | owner | подтвердить результат → Deal |
| POST | `/auctions/{pk}/reject-result/` | owner | отклонить результат → FAILED |
| POST | `/auctions/{pk}/decline-result/` | owner | отказ от победителя → след. кандидат |
| POST | `/auctions/{pk}/request-documents/` | owner/admin | запросить документы у брокера |
| GET | `/auctions/{pk}/document-requests/` | | список запросов |
| POST | `/auctions/document-requests/{pk}/upload/` | broker | ответ на запрос |

> Open-ставки делаются **не** через REST, а через WebSocket (раздел 8).

### Deals (`apps/deals/urls.py` → `/deals/`)

| Метод | Путь | Кто | Назначение |
|-------|------|-----|-----------|
| GET | `/deals/` | auth | список (брокер видит свои, девелопер — свои, админ — все) |
| GET | `/deals/{pk}/` | участник/admin | деталь |
| POST | `/deals/{pk}/upload-ddu/` | broker | загрузить ДДУ |
| POST | `/deals/{pk}/upload-payment-proof/` | broker | загрузить оплату |
| PATCH | `/deals/{pk}/comment/` | broker | комментарий |
| POST | `/deals/{pk}/submit-for-review/` | broker | на проверку |
| POST | `/deals/{pk}/admin-approve/` | admin | одобрить |
| POST | `/deals/{pk}/admin-reject/` | admin | отклонить (reason) |
| POST | `/deals/{pk}/developer-confirm/` | developer | подтвердить |
| POST | `/deals/{pk}/developer-reject/` | developer | отклонить (reason) |
| GET | `/deals/{pk}/logs/` | участник/admin | аудит-лог |

### Payments (`apps/payments/urls.py` → `/payments/`)

| Метод | Путь | Назначение |
|-------|------|-----------|
| GET | `/payments/` | список выплат |
| GET | `/payments/summary/` | сводка |
| POST | `/payments/{pk}/upload-receipt/` | загрузить чек (переводит payment в PAID) |
| GET | `/payments/settlements/` | расчёты (DealSettlement) |
| GET | `/payments/settlements/summary/` | сводка по расчётам |
| POST | `/payments/settlements/{pk}/mark-paid-to-broker/` | админ: фикс выплаты брокеру |
| POST | `/payments/settlements/{pk}/upload-developer-receipt/` | девелопер: чек оплаты |
| POST | `/payments/settlements/{pk}/confirm-developer-receipt/` | админ: подтвердить чек |
| POST | `/payments/settlements/{pk}/reject-developer-receipt/` | админ: отклонить чек (reason) |

### Notifications (`apps/notifications/urls.py` → `/notifications/`)

| Метод | Путь | Назначение |
|-------|------|-----------|
| GET | `/notifications/` | список (пагинация, если включена глобально) |
| GET | `/notifications/unread-count/` | счётчик непрочитанных |
| PATCH | `/notifications/mark-read/` | отметить одно (`{notification_id}`) |
| PATCH | `/notifications/mark-all-read/` | отметить все |

---

## 8. Realtime (WebSocket)

Django Channels (ASGI) через uvicorn. Аутентификация — **SimpleJWT access token в
query string** (`?token=…`), middleware `JwtAuthMiddleware` (`migtender/middleware.py`).
Использовать только access token; при истечении — переподключаться с новым.
В проде только `wss://`. Nginx должен прокидывать upgrade-заголовки для `/ws/`.

> Полный контракт сообщений — в `auction/WEBSOCKET.md` (open-аукцион) и
> `auction/NOTIFICATIONS.md` (раздел 6, уведомления).

### Каналы (`auctions/routing.py`, `notifications/routing.py`)

| URL | Consumer | Кто | Назначение |
|-----|----------|-----|-----------|
| `ws/auctions/` | `AuctionsGlobalConsumer` | все | read-only firehose `auction_status_changed` для каталога/списков |
| `ws/auctions/<id>/` | `AuctionLiveBidConsumer` | все (ставки — брокер) | **живой OPEN-аукцион**: snapshot + ставки в реальном времени |
| `ws/auctions/<id>/sealed-bids/` | `ClosedAuctionBidsConsumer` | **owner/admin** (брокерам закрыт, code 4403) | список sealed-ставок CLOSED владельцу/админу, read-only |
| `ws/notifications/` | (notifications consumer) | auth | персональные уведомления |

### OPEN-аукцион (`AuctionLiveBidConsumer`)

- При подключении: проверяет, что аукцион OPEN (иначе close `4403`), отдаёт
  `auction_snapshot` (последние 50 ставок) + `participants_snapshot`.
- **Клиент → сервер:** `{type: "bid", amount, client_id?}`.
- **Сервер → клиенты комнаты** (`auction_<id>`): `bid_created` / `bid_updated`
  (с патчем `auction`), `participant_joined`, `auction_updated`. Ошибки —
  `{type: "error", detail}` только отправителю.
- Размещение ставки атомарно (`transaction.atomic` + `select_for_update`), правила —
  `auctions/services/rules.py` (брокер верифицирован, окно активно, не владелец,
  ≥ `min_price`, первая ≥ min_price / далее ≥ `current_price + min_bid_increment`,
  одна open-ставка на брокера — обновляется).
- **Защита ФИО:** брокерам имена конкурентов вычищаются из payload
  (`_scrub_bid_for_non_owner`) — чтобы не утекали через DevTools. Owner/admin видят
  ФИО.

### CLOSED sealed-bids (`ClosedAuctionBidsConsumer`)

Read-only для владельца/админа. Брокеру WS закрыт (создание/правка ставок — через
HTTP, см. раздел 7). Snapshot `sealed_bids_snapshot`; события
`sealed_bid_changed`, `sealed_participants_changed`, `auction_updated`
(broadcast'ятся из HTTP-вьюх через `auctions/realtime.py`).

### Коды закрытия

`4401` — не аутентифицирован (нет/невалиден/истёк токен → refresh + reconnect);
`4403` — нет прав (брокер на sealed-канале, или не-OPEN на live-канале);
`4404` — ошибка (напр., не closed-аукцион на sealed-канале).

---

## 9. Уведомления

Полная спецификация — **`auction/NOTIFICATIONS.md`** (35 КБ: модель, WS-контракт,
все `event_type`, рекомендации фронту, Celery-задачи). Здесь — выжимка.

**Принцип:** уведомление сначала пишется в БД, затем через
`transaction.on_commit()` пушится в персональный Channels-канал пользователя
(`ws/notifications/`). Не через Django signals — а явными вызовами `notify_*` из
`views`/`services`/`tasks` в точный момент бизнес-перехода (проще отлаживать и
объяснять).

**Каналы доставки:** in-app (БД + WebSocket realtime + REST fallback) и **email**
(SMTP, отдельные Celery-задачи `send_*_email` — независимы от in-app).

**WebSocket-события** (сервер→клиент): `notifications_snapshot` (при подключении,
последние 50 + `unread_count`), `notification_created`, `notification_read`,
`notifications_read_all`, `pong`, `error`. Клиент→сервер: `ping`, `mark_read`,
`mark_all_read`. REST-fallback — см. раздел 7.

**Навигация на фронте** — по `event_type` + `data` + `*_id` (`deal_id`,
`payment_id`, `auction_id`, `real_property_id`), не по тексту `message`
(`shared/lib/notification-route.ts`).

### События (`event_type`) и получатели

| event_type | Кому | Когда |
|-----------|------|-------|
| `new_broker_registered` | админ | зарегистрировался брокер |
| `new_property_pending` | админ | объект ушёл на модерацию |
| `auction_won` | брокер | создана сделка победителю |
| `auction_not_selected` | брокеры | в closed выбран победитель (остальным) |
| `auction_finished_open` / `auction_finished_closed` | владелец | завершён open/closed аукцион |
| `documents_deadline_3d` / `documents_deadline_1d` | брокер | за 3 / 1 день до дедлайна документов |
| `obligation_overdue` | брокер + админы | обязательство просрочено |
| `deal_submitted_for_review` | админы + девелопер | брокер отправил сделку на review |
| `admin_approved` / `admin_rejected` | брокер | админ одобрил / отклонил документы |
| `developer_needs_confirm` / `developer_confirm_reminder` | девелопер | нужно подтвердить / напоминание |
| `developer_confirmed` / `developer_rejected` | брокер + админы | девелопер подтвердил / отклонил |
| `payout_created` / `payout_paid` | брокер + девелопер | созданы выплаты / выплата проведена |
| `daily_deals_summary` / `daily_payments_summary` | админ | ежедневные сводки |

### Celery-задачи уведомлений и расписание (`migtender/celery.py`)

| Задача | Расписание | Назначение |
|--------|-----------|-----------|
| `notifications.tasks.send_document_deadline_reminders` | 09:00 | напоминания о дедлайне документов |
| `notifications.tasks.notify_overdue_deals_task` | 09:10 | просроченные обязательства |
| `notifications.tasks.send_developer_confirm_reminders` | 10:00 | напоминания девелоперу подтвердить |
| `notifications.tasks.send_admin_daily_deals_summary` | 08:00 | сводка по сделкам на review |
| `notifications.tasks.send_admin_daily_payments_summary` | 08:05 | сводка по выплатам |
| `auctions.tasks.sweep_overdue_auctions` | каждые 5 мин | дозакрытие просроченных аукционов |
| `deals.tasks.check_overdue_deals` | 04:00 | пометить overdue |
| `deals.tasks.mark_failed_pending_deals` | 04:15 | авто-fail зависших сделок |
| `payments.tasks.check_broker_payout_deadlines` | 09:30 | дедлайны выплат брокеру |
| `payments.tasks.check_developer_payment_deadlines` | 09:40 | дедлайны оплаты девелопером |
| `migtender.tasks.cleanup_beat_tasks` | 03:00 | чистка отработавших one-off задач |

> Дедупликация cron-уведомлений — через `Notification.dedupe_key` (unique).

---

## 10. Разработка

### Локальный запуск — фронт

```bash
cd mig-tender-front
cp .env.example .env.local   # заполнить NEXT_PUBLIC_API_URL, NEXT_PUBLIC_DADATA_TOKEN
npm install                  # или: bun install (есть bun.lock)
npm run dev                  # Next dev (Turbopack)
```

Прочие скрипты: `npm run build` (prod-сборка), `npm run start` (порт 3007),
`npm run lint` (ESLint).

### Локальный запуск — бэк

Зависимости: PostgreSQL 16 (БД `migtender`), Redis. Подробная инструкция —
`auction/README.md`.

```bash
cd auction
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # заполнить (settings, SMTP, Redis URLs, FILE_ENCRYPTION_KEY, DB_*)
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000      # dev (daphne включён в dev-настройках для WS)
# для WebSocket под прод-подобный запуск:
uvicorn migtender.asgi:application --host 0.0.0.0 --port 8000

# Celery (в отдельных терминалах):
celery -A migtender worker -l info
celery -A migtender beat -l info
```

> Без запущенных Celery worker **и** beat не работают: переключение статусов
> аукционов, авто-fail сделок, дедлайны, напоминания, ежедневные сводки.

### Тесты, линт

- **Бэк:** `python3 manage.py test`. Тесты лежат в `apps/*/tests/`. Тестовый
  профиль — `migtender/settings/test.py`. Pre-commit: `pre-commit install` +
  `pre-commit run --all-files` (`.pre-commit-config.yaml`; black/flake8/isort,
  `setup.cfg`).
- **Фронт:** `npm run lint` (ESLint, `eslint.config.mjs`). Юнит-тестов в репозитории
  на момент написания нет.

### Билд и известные проблемы

- **Фронт, pre-existing TS errors:** в проекте есть незакрытые ошибки типов;
  prod-сборка их **игнорирует** — в `next.config.ts` подразумевается
  `typescript: { ignoreBuildErrors: true }` (см. `CLAUDE.md`; в текущем
  `next.config.ts` ключ может быть не выставлен — **проверить и при необходимости
  вернуть**, иначе `npm run build` упадёт на этих ошибках).
- **Next.js 16:** требует ключ `turbopack: {}` в конфиге (есть, с SVG-правилами +
  webpack-фолбэк через `@svgr/webpack`). `output: 'standalone'` для Docker.
- **Деплой фронта чистит `.next`** перед сборкой — иначе Next переиспользует старые
  чанки и прод грузит вчерашний бандл.
- **Шифрование файлов:** при смене/потере `FILE_ENCRYPTION_KEY` все ранее
  загруженные файлы и PII становятся нечитаемыми. Ключ бэкапить.
- **Тайминги аукционов** временно отключены в `settings/base.py` (см. раздел 2).
- **Дубли деплой-пайплайнов** (GitHub Actions + GitLab CI, systemd + Docker) — в
  каждом репо описаны оба; уточнить, какой контур актуален для прода.

### Доменная документация (бэк)

- `auction/README.md` — установка и запуск.
- `auction/WEBSOCKET.md` — гайд по live-bidding (Channels), контракт сообщений,
  nginx, типичные проблемы.
- `auction/NOTIFICATIONS.md` — полная спецификация модуля уведомлений.

### Доменная документация (фронт)

- `mig-tender-front/CLAUDE.md` — стек, **строгая дизайн-система** (Tailwind-маппинг),
  ключевая архитектура, флоу регистрации, known issues, известные пробелы бэка
  (developer profile).
- `mig-tender-front/AGENTS.md` — индекс локальной копии документации Next.js
  (`.next-docs`).
- `mig-tender-front/newupdates/*.md` — точечные ТЗ по фичам:
  `AUCTION_DECLINE_RESULT.md` (отказ от результата), `AUCTION_RESULT_DECISION.md`
  (решение владельца), `DEAL_FAILED_STATUS.md` (статус failed),
  `DOCUMENT_REQUESTS.md` (запросы документов), `PROFILE_UPDATE.md` (обновление профиля).
