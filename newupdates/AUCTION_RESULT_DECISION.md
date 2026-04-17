# ТЗ 8.2 — Кнопки «Подтвердить» / «Отказать» для девелопера по результату аукциона

Изменения фронта, необходимые после изменения потока завершения аукциона и
добавления двух новых endpoint'ов.

---

## 1. Что изменилось в бэкенде

До этой фичи по завершению аукциона **автоматически** создавалась сделка
(`Deal`). Теперь — нет. Владелец аукциона (девелопер) должен явно подтвердить
или отклонить результат.

### Схема

```
finish_auction (celery, по end_date)
  ├─ status = FINISHED
  ├─ OPEN:   winner_bid = highest_bid
  ├─ CLOSED: auto_select_closed_winner → winner_bid = top sealed bid
  ├─ owner_decision = PENDING
  └─ notify owner «awaiting decision»

Developer / Admin:
  ├─ POST /api/v1/auctions/{id}/confirm-result/   → Deal(s) created, owner_decision=CONFIRMED
  └─ POST /api/v1/auctions/{id}/reject-result/    → status=FAILED, owner_decision=REJECTED
```

### Новые поля на `Auction`

| Поле                     | Тип              | Возможные значения                        |
| ------------------------ | ---------------- | ----------------------------------------- |
| `owner_decision`         | string (enum)    | `pending` \| `confirmed` \| `rejected`    |
| `owner_rejection_reason` | string           | причина отказа (пусто если подтверждено)  |
| `owner_decided_at`       | datetime \| null | время решения                             |

### Новое значение `auction.status`

| API value  | Подпись (RU)     |
| ---------- | ---------------- |
| `failed`   | Несостоявшийся   |

Старые значения (`scheduled`, `active`, `finished`, `cancelled`) остаются.

---

## 2. Новые endpoint'ы

### 2.1. Подтвердить результат

```http
POST /api/v1/auctions/{id}/confirm-result/
Authorization: Bearer <jwt>
```

**Тело:** пустое.

**Когда доступен:**
- `auction.status == finished`
- `auction.owner_decision == pending`
- `auction.winner_bid` != null (для OPEN — автоматически, для CLOSED — после
  того как девелопер вызвал `select-winner` или автоматический выбор победителя
  в `finish_auction` подхватил топ-ставку)

**Доступ:** `auction.owner` или `admin`.

**Ответ 200:**

```json
{
  "auctionId": 42,
  "ownerDecision": "confirmed",
  "createdDealIds": [123]
}
```

Для CLOSED лота с несколькими property массив `createdDealIds` будет содержать
несколько id.

**Ошибки:**

- `400` — статус не `finished`, уже подтверждён/отклонён, нет `winner_bid`, нет объекта в лоте
- `401` — нет JWT
- `403` — не владелец и не админ
- `404` — аукцион не найден

### 2.2. Отклонить результат

```http
POST /api/v1/auctions/{id}/reject-result/
Authorization: Bearer <jwt>
Content-Type: application/json

{ "reason": "Цена ниже ожидаемой" }
```

**Тело:** `reason` обязательное, до 2000 символов, не пустое.

**Когда доступен:** то же, что у confirm (`finished` + `pending`). Даже если
`winner_bid == null` (пустой аукцион), отклонить результат можно — это просто
переводит аукцион в `failed`.

**Доступ:** `auction.owner` или `admin`.

**Ответ 200:**

```json
{
  "auctionId": 42,
  "status": "failed",
  "ownerDecision": "rejected"
}
```

**Эффекты:**
- `auction.status = failed`
- `auction.owner_decision = rejected`
- `auction.owner_rejection_reason = reason`
- сделка **НЕ** создаётся
- победитель-брокер (если был) получает уведомление с указанием причины
- все админы получают уведомление

**Ошибки:**

- `400` — статус не `finished`, уже принято решение, пустой `reason`
- `401`, `403`, `404` — как у confirm

**Статус `failed` терминальный:** восстановить аукцион нельзя. Если девелопер
передумал — заводит новый аукцион по тому же объекту.

---

## 3. Что поменять на фронте

### 3.1. Enum'ы и локализация

```ts
enum AuctionStatus {
  SCHEDULED = "scheduled",
  ACTIVE    = "active",
  FINISHED  = "finished",
  CANCELLED = "cancelled",
  FAILED    = "failed",        // новый
}

enum AuctionOwnerDecision {
  PENDING   = "pending",
  CONFIRMED = "confirmed",
  REJECTED  = "rejected",
}
```

Подписи:

| status     | badge text     |
| ---------- | -------------- |
| `finished` | Завершён       |
| `failed`   | Несостоявшийся |

### 3.2. Карточка аукциона (для девелопера)

Когда `auction.status == finished` и `owner_decision == pending`:

- показать блок «Результат аукциона» с победителем (broker + amount)
- две кнопки:
  - **«Подтвердить результат»** → `POST /confirm-result/`
  - **«Отклонить результат»** → открывает модалку с полем `reason`, затем `POST /reject-result/`
- если `winner_bid == null` — кнопка «Подтвердить» задизейблена (бэкенд вернёт 400)

Когда `owner_decision == confirmed`:
- показать «Результат подтверждён», ссылку на созданную сделку (`/deals/{id}`)
- кнопки скрыты

Когда `owner_decision == rejected` (или `status == failed`):
- показать «Результат отклонён» + reason
- кнопки скрыты

### 3.3. Список аукционов

- добавить `failed` в фильтр по статусу
- на карточке отображать бейдж «Несостоявшийся» для `status == failed`
- опционально: индикатор «Ожидает решения» у FINISHED-аукционов, где `owner_decision == pending`
  (полезно девелоперу — сразу видно, что нужно зайти и принять решение)

### 3.4. Брокер — лента и карточка аукциона

Если брокер был победителем и девелопер отклонил:

- в карточке аукциона показать статус «Несостоявшийся» + reason
- в уведомлениях появится `event_type = auction_result_rejected`

### 3.5. Уведомления

Новые `event_type`:

| event_type                   | Кому        | data                                              |
| ---------------------------- | ----------- | ------------------------------------------------- |
| `auction_finished_open`      | Devеloper   | добавлено `awaiting_owner_decision: true` в data  |
| `auction_result_confirmed`   | Admin       | `{ auction_id, winner_bid_id, broker_id }`        |
| `auction_result_rejected`    | Broker+Admin| `{ auction_id, winner_bid_id, reason }`           |

Добавьте маппинг иконок/подписей для двух новых `event_type`.

### 3.6. CLOSED-flow: select-winner больше не создаёт сделку

Если фронт уже использует `POST /auctions/{id}/select-winner/` для закрытого
аукциона, имейте в виду:

- этот endpoint теперь **только выставляет** `winner_bid` + `shortlisted_bids`
- сделка создаётся только после `POST /confirm-result/`
- в UI можно объединить два шага в один (после select-winner сразу подтверждать)
  или развести — на ваше усмотрение

---

## 4. Чек-лист для фронта

- [ ] добавить `failed` в enum `AuctionStatus` + локализацию
- [ ] добавить enum `AuctionOwnerDecision`
- [ ] на карточке аукциона (FINISHED + owner_decision=pending) показать панель
      решения с двумя кнопками
- [ ] модалка «Отклонить результат» с обязательным полем причины
- [ ] вызвать `POST /confirm-result/` и `POST /reject-result/`
- [ ] показывать результат решения после того, как оно принято (текст + reason)
- [ ] добавить `failed` в фильтры списка аукционов
- [ ] обработать `auction_result_confirmed` и `auction_result_rejected` в ленте
      уведомлений
- [ ] если используется `POST /select-winner/` для CLOSED — учесть, что сделка
      теперь создаётся только после `/confirm-result/`

---

## 5. Вопросы для продукта

- Нужен ли автоматический аукцион на тот же объект после `failed`? Сейчас нет — девелопер создаёт новый вручную.
- Нужен ли deadline, после которого решение считается подтверждённым автоматом, чтобы сделка не висела? Сейчас нет.
- Должен ли admin видеть пункт в своей очереди «аукционы, ждущие решения девелопера»? Сейчас нет.
