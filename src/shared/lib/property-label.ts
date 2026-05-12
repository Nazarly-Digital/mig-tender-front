/**
 * Форматирует «дискриминатор» объекта недвижимости — короткую строку
 * атрибутов, отличающих две квартиры по одному адресу
 * («34.00 м² · 5 этаж · кв. 12»). Используется в карточках сделок
 * где deal.properties может содержать несколько объектов с одинаковым
 * полем address (один комплекс, разные секции/этажи).
 *
 * Возвращает пустую строку если не из чего собрать дискриминатор —
 * caller сам решит как рендерить (например, упустить отдельную строку).
 */

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Квартира',
  commercial: 'Коммерция',
  house: 'Дом',
  townhouse: 'Таунхаус',
  land: 'Участок',
};

type PropertyLike = {
  id?: number | null;
  area?: string | null;
  floor?: number | null;
  house_number?: string | null;
  land_number?: string | null;
  type?: string | null;
  rooms?: number | null;
};

export function formatPropertyDiscriminator(p: PropertyLike): string {
  const parts: string[] = [];

  if (p.type && PROPERTY_TYPE_LABELS[p.type]) {
    parts.push(PROPERTY_TYPE_LABELS[p.type]);
  }
  if (p.rooms != null && p.rooms > 0) {
    parts.push(`${p.rooms} комн.`);
  }
  if (p.floor != null && p.floor > 0) {
    parts.push(`${p.floor} этаж`);
  }
  if (p.house_number) {
    parts.push(`дом ${p.house_number}`);
  }
  if (p.land_number) {
    parts.push(`участок ${p.land_number}`);
  }
  if (p.area) {
    // У land площадь в сотках, у остальных — в м². Без знания типа
    // здесь упрощаем — выводим число + м². Если потребуется
    // правильная единица, передавай через type выше.
    const unit = p.type === 'land' ? 'сот' : 'м²';
    parts.push(`${p.area} ${unit}`);
  }

  // Если ни одного дискриминатора нет — ID объекта как fallback,
  // чтобы два РАЗНЫХ property с одинаковым address не выглядели
  // как дубликат строки (см. QA: Ростовская обл + Ростовская обл
  // у одного брокера — это разные объекты в M2M, у обоих не
  // заполнен этаж/площадь/тип, дискриминатор пустой).
  if (parts.length === 0 && p.id != null) {
    parts.push(`объект #${p.id}`);
  }

  return parts.join(' · ');
}
