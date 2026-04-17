// Human-readable labels for Deal log actions.
// Used by any UI that renders the DealLogEntry[] returned by GET /deals/{id}/logs/.

const DEAL_LOG_ACTION_LABELS: Record<string, string> = {
  submitted_for_review: "Отправлена на проверку",
  admin_approved: "Одобрена администратором",
  admin_rejected: "Отклонена администратором",
  developer_confirmed: "Подтверждена девелопером",
  developer_rejected: "Отклонена девелопером",
  ddu_uploaded: "Загружен ДДУ",
  payment_proof_uploaded: "Загружено подтверждение оплаты",
  comment_updated: "Комментарий обновлён",
  marked_overdue: "Обязательство просрочено",
  marked_failed: "Автоматически помечена как несостоявшаяся",
  // TZ 8.5 — developer declined the auction result; deal closed without completion.
  marked_declined: "Девелопер отказался от результата аукциона",
};

export function dealLogActionLabel(action: string): string {
  return DEAL_LOG_ACTION_LABELS[action] ?? action;
}
