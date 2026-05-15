import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Strict email validation — two-layer:
//
// 1) Shape check: RFC-like regex with a curated TLD whitelist. Blocks typos
//    like «test@example.comg» that pass the default `z.string().email()`.
// 2) Provider check: if the domain belongs to a known email provider, it
//    must match one of the provider's real domains exactly. Blocks typos
//    like «dadw@gmail.co» that otherwise pass the shape check because `.co`
//    is a legitimate TLD (Colombia).
//
// Custom / corporate domains fall through to check #1 only.

const STRICT_EMAIL_TLDS = [
  // generic
  'com', 'org', 'net', 'info', 'biz', 'name', 'pro', 'xyz', 'online', 'site',
  'store', 'shop', 'cloud', 'app', 'dev', 'tech', 'io', 'co', 'me', 'edu',
  'gov', 'mil', 'int',
  // CIS
  'ru', 'by', 'ua', 'kz', 'kg', 'uz', 'tm', 'tj', 'az', 'am', 'ge', 'md',
  // EU
  'uk', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'cz', 'fi', 'se', 'no', 'dk',
  'ch', 'at', 'be', 'ie', 'pt', 'gr', 'ro', 'hu', 'sk', 'bg', 'hr', 'lt',
  'lv', 'ee', 'is',
  // Asia / Pacific
  'jp', 'cn', 'hk', 'tw', 'kr', 'in', 'id', 'th', 'vn', 'my', 'sg', 'ph',
  'au', 'nz',
  // Americas / Africa / Middle East
  'us', 'ca', 'br', 'ar', 'mx', 'cl', 'pe', 'za', 'tr', 'il', 'ae', 'sa',
];

const strictEmailRegex = new RegExp(
  `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.(${STRICT_EMAIL_TLDS.join('|')})$`,
  'i',
);

// Known email providers and their allowed full domains. The key matches the
// first label of the domain (everything before the first dot). If an email's
// domain starts with one of these keys, the full domain MUST be in the list.
const KNOWN_PROVIDER_DOMAINS: Record<string, readonly string[]> = {
  gmail: ['gmail.com'],
  googlemail: ['googlemail.com'],
  yahoo: [
    'yahoo.com', 'yahoo.co.uk', 'yahoo.co.jp', 'yahoo.fr', 'yahoo.de',
    'yahoo.es', 'yahoo.it', 'yahoo.ca', 'yahoo.com.br', 'yahoo.com.au',
    'yahoo.com.mx', 'yahoo.com.tr', 'yahoo.com.ar', 'yahoo.com.ph',
  ],
  hotmail: [
    'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de',
    'hotmail.es', 'hotmail.it', 'hotmail.ru',
  ],
  outlook: ['outlook.com', 'outlook.fr', 'outlook.de', 'outlook.es', 'outlook.it'],
  live: ['live.com', 'live.ru', 'live.co.uk'],
  msn: ['msn.com'],
  yandex: ['yandex.ru', 'yandex.com', 'yandex.kz', 'yandex.by', 'yandex.ua'],
  mail: ['mail.ru', 'mail.com'],
  inbox: ['inbox.ru', 'inbox.lv'],
  list: ['list.ru'],
  bk: ['bk.ru'],
  rambler: ['rambler.ru'],
  icloud: ['icloud.com'],
  protonmail: ['protonmail.com'],
  proton: ['proton.me'],
  aol: ['aol.com'],
  zoho: ['zoho.com', 'zoho.eu'],
  fastmail: ['fastmail.com', 'fastmail.fm'],
  tutanota: ['tutanota.com'],
  gmx: ['gmx.com', 'gmx.de', 'gmx.net'],
};

// Levenshtein distance — classic DP. Small strings only (domain labels),
// O(m*n) is fine. Used to detect typos in provider labels.
const levenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
};

const checkProviderDomain = (email: string): boolean => {
  const at = email.indexOf('@');
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase();
  const firstLabel = domain.split('.')[0];
  if (!firstLabel) return false;

  // Exact-match path: full domain must be in allowed list for this provider.
  const exact = KNOWN_PROVIDER_DOMAINS[firstLabel];
  if (exact) return exact.includes(domain);

  // Fuzzy-match path: reject labels that are very close to a known provider
  // label but not exactly it — catches typos like «gmdail», «gmial», «gnail»,
  // «outloook», «yhaoo», «yandx» etc. Only applied to providers with label
  // length ≥5 to avoid false positives on short custom domains.
  for (const candidate of Object.keys(KNOWN_PROVIDER_DOMAINS)) {
    if (candidate.length < 5) continue;
    if (Math.abs(candidate.length - firstLabel.length) > 2) continue;
    if (levenshtein(firstLabel, candidate) <= 2) return false;
  }
  return true; // genuinely custom domain — let it pass
};

const strictEmail = () =>
  z
    .string()
    .min(1, 'Введите email')
    .transform((v) => v.replace(/\s/g, ''))
    .pipe(
      z
        .string()
        .regex(strictEmailRegex, 'Введите корректный email')
        .refine(checkProviderDomain, 'Проверьте email'),
    );

// === Auth ===

// ТЗ от 2026-05-14: упрощённая регистрация без email — broker
// логинится по номеру телефона. Logic:
//   - если ввели email → шлём как email
//   - если ввели телефон (содержит цифры, не похож на email) → бэк
//     генерил placeholder `<digits>@noemail.local` при регистрации,
//     фронт нормализует ввод в этот формат перед отправкой.
// Поэтому field называется `email` для совместимости с бэком (поле
// JWT TokenObtainPairSerializer), но принимает и phone.
// ТЗ от 2026-05-15 — логин только по email (раньше принимал и телефон).
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Преобразуем "ввели телефон" → placeholder email который бэк ждёт
// после simple-register. Email-вход остаётся как есть.
export function normalizeLoginIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  // Телефон — оставляем только цифры; +7XXX… → 7XXX…; 8XXX… → 7XXX…
  let digits = trimmed.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }
  return `${digits}@noemail.local`;
}

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Введите текущий пароль'),
    new_password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .max(128, 'Максимум 128 символов'),
    new_password_confirm: z.string().min(1, 'Повторите новый пароль'),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: 'Пароли не совпадают',
    path: ['new_password_confirm'],
  })
  .refine((d) => d.new_password !== d.old_password, {
    message: 'Новый пароль должен отличаться от текущего',
    path: ['new_password'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const emailStepSchema = z.object({
  email: strictEmail(),
});

export type EmailStepFormData = z.infer<typeof emailStepSchema>;

export const passwordResetConfirmSchema = z
  .object({
    new_password: z
      .string()
      .min(1, 'Введите пароль')
      .min(8, 'Минимум 8 символов')
      .max(128, 'Максимум 128 символов'),
    new_password_confirm: z
      .string()
      .min(1, 'Подтвердите пароль'),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: 'Пароли не совпадают',
    path: ['new_password_confirm'],
  });

export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;

// Russian + Latin letters, with optional hyphens/spaces for compound names.
const NAME_RE = /^[A-Za-zА-Яа-яЁё]+(?:[\s-][A-Za-zА-Яа-яЁё]+)*$/;

export const brokerRegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Введите имя')
      .refine((v) => NAME_RE.test(v), 'Только буквы'),
    lastName: z
      .string()
      .min(1, 'Введите фамилию')
      .refine((v) => NAME_RE.test(v), 'Только буквы'),
    innNumber: z
      .string()
      .min(1, 'Введите ИНН номер')
      .refine((v) => /^\d+$/.test(v), { message: 'ИНН должен содержать только цифры' })
      .refine((v) => v.length === 10 || v.length === 12, {
        message: 'ИНН должен содержать 10 или 12 цифр',
      }),
    phoneNumber: z
      .string()
      .min(1, 'Введите номер телефона')
      .refine((v) => v.trim().startsWith('+'), {
        message: 'Номер должен начинаться с + и кода страны',
      })
      .refine((v) => isValidPhoneNumber(v.trim()), {
        message: 'Введите корректный номер для выбранной страны',
      }),
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(8, 'Минимум 8 символов'),
    passwordConfirm: z
      .string()
      .min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  });

export type BrokerRegisterFormData = z.infer<typeof brokerRegisterSchema>;

const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_DOC_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
];

const optionalFile = z
  .any()
  .optional()
  .refine(
    (file) => !file || (file instanceof File && file.size <= MAX_DOC_SIZE),
    'Файл должен быть не больше 10 МБ',
  )
  .refine(
    (file) => !file || (file instanceof File && ACCEPTED_DOC_MIME.includes(file.type)),
    'Поддерживаются: JPG, PNG, WEBP, HEIC, PDF',
  );

const requiredPdf = z
  .any()
  .refine((file) => file instanceof File, 'Загрузите PDF')
  .refine(
    (file) => file instanceof File && file.size <= MAX_DOC_SIZE,
    'Файл должен быть не больше 10 МБ',
  )
  .refine(
    (file) => file instanceof File && file.type === 'application/pdf',
    'Файл должен быть в формате PDF',
  );

const optionalPdf = z
  .any()
  .optional()
  .refine(
    (file) => file === undefined || (file instanceof File && file.size <= MAX_DOC_SIZE),
    'Файл должен быть не больше 10 МБ',
  )
  .refine(
    (file) => file === undefined || (file instanceof File && file.type === 'application/pdf'),
    'Файл должен быть в формате PDF',
  );

// Admin: create developer
export const adminCreateDeveloperSchema = z
  .object({
    email: strictEmail(),
    firstName: z
      .string()
      .min(1, 'Введите имя')
      .max(50, 'Максимум 50 символов'),
    lastName: z
      .string()
      .min(1, 'Введите фамилию')
      .max(50, 'Максимум 50 символов'),
    companyName: z
      .string()
      .min(1, 'Введите название компании')
      .max(55, 'Максимум 55 символов'),
    innNumber: z
      .string()
      .min(1, 'Введите ИНН')
      .refine((v) => /^\d+$/.test(v), { message: 'ИНН должен содержать только цифры' })
      .refine((v) => v.length === 10 || v.length === 12, {
        message: 'ИНН должен содержать 10 или 12 цифр',
      }),
    phoneNumber: z
      .string()
      .min(1, 'Введите номер телефона')
      .refine((v) => v.trim().startsWith('+'), {
        message: 'Номер должен начинаться с + и кода страны',
      })
      .refine((v) => isValidPhoneNumber(v.trim()), {
        message: 'Введите корректный номер для выбранной страны',
      }),
    innDocument: optionalFile,
    passportDocument: optionalFile,
    dduTemplate: requiredPdf,
    password: z
      .string()
      .min(8, 'Минимум 8 символов')
      .max(128, 'Максимум 128 символов'),
    passwordConfirm: z
      .string()
      .min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  });

export type AdminCreateDeveloperFormData = z.infer<typeof adminCreateDeveloperSchema>;

// Admin: edit developer (PATCH)
export const adminUpdateDeveloperSchema = z.object({
  email: strictEmail(),
  firstName: z
    .string()
    .min(1, 'Введите имя')
    .max(50, 'Максимум 50 символов'),
  lastName: z
    .string()
    .min(1, 'Введите фамилию')
    .max(50, 'Максимум 50 символов'),
  companyName: z
    .string()
    .min(1, 'Введите название компании')
    .max(55, 'Максимум 55 символов'),
  innNumber: z
    .string()
    .refine((v) => v === '' || /^\d{12}$/.test(v), 'ИНН должен состоять из 12 цифр'),
  phoneNumber: z
    .string()
    .max(20, 'Максимум 20 символов'),
  dduTemplate: optionalPdf,
});

export type AdminUpdateDeveloperFormData = z.infer<typeof adminUpdateDeveloperSchema>;

// Admin: edit broker (PATCH /admin/users/<id>/)
export const adminUpdateBrokerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Введите имя')
    .max(50, 'Максимум 50 символов'),
  lastName: z
    .string()
    .min(1, 'Введите фамилию')
    .max(50, 'Максимум 50 символов'),
  innNumber: z
    .string()
    .refine((v) => v === '' || /^\d{12}$/.test(v), 'ИНН должен состоять из 12 цифр'),
  phoneNumber: z
    .string()
    .max(20, 'Максимум 20 символов'),
});

export type AdminUpdateBrokerFormData = z.infer<typeof adminUpdateBrokerSchema>;

// === Properties ===

// Upper bounds to catch clearly-bogus values (Infinity, overflow) without
// rejecting realistic data. Generous by design.
const MAX_AREA = 10_000_000;
const MAX_PRICE = 1_000_000_000_000;
const MAX_FLOOR = 250;
const MAX_COMMISSION_RATE = 100;

const isFiniteInRange = (v: string, lo: number, hi: number, inclusiveLo = false): boolean => {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return false;
  return inclusiveLo ? n >= lo && n <= hi : n > lo && n < hi;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const propertySchema = z.object({
  type: z.string().min(1, 'Выберите тип'),
  address: z
    .string()
    .trim()
    .min(1, 'Введите адрес')
    .max(500, 'Слишком длинно'),
  area: z
    .string()
    .min(1, 'Введите площадь')
    .refine((v) => parseFloat(v) > 0, 'Площадь должна быть больше 0')
    .refine((v) => isFiniteInRange(v, 0, MAX_AREA), 'Некорректное значение'),
  property_class: z.string().optional(),
  price: z
    .string()
    .min(1, 'Введите цену')
    .refine((v) => parseFloat(v) > 0, 'Цена должна быть больше 0')
    .refine((v) => isFiniteInRange(v, 0, MAX_PRICE), 'Некорректное значение'),
  currency: z.string().min(1),
  deadline: z
    .string()
    .optional()
    .refine((v) => !v || ISO_DATE_RE.test(v), 'Неверная дата'),
  commission_rate: z
    .string()
    .min(1, 'Укажите комиссию брокера')
    .refine((v) => parseFloat(v) >= 0, 'Комиссия должна быть >= 0')
    .refine(
      (v) => isFiniteInRange(v, 0, MAX_COMMISSION_RATE, true),
      'Комиссия не может превышать 100%',
    ),
  status: z.string().min(1, 'Выберите статус'),
  show_price_to_brokers: z.boolean().optional(),
  floor: z.string().optional(),
  developer_name: z
    .string()
    .trim()
    .min(1, 'Введите название застройщика')
    .max(200, 'Слишком длинно'),
  project: z
    .string()
    .trim()
    .min(1, 'Введите название проекта')
    .max(200, 'Слишком длинно'),
  project_comment: z
    .string()
    .max(2000, 'Слишком длинный комментарий')
    .optional(),
  commercial_subtype: z.string().optional(),
  land_number: z
    .string()
    .max(32, 'Слишком длинно')
    .optional(),
  house_number: z
    .string()
    .max(32, 'Слишком длинно')
    .optional(),
}).refine(
  (data) => data.type === 'land' || (data.property_class && data.property_class.length > 0),
  { message: 'Выберите класс', path: ['property_class'] },
).refine(
  (data) => {
    if (data.type !== 'commercial') return true;
    return !!data.commercial_subtype && data.commercial_subtype.length > 0;
  },
  { message: 'Выберите подтип', path: ['commercial_subtype'] },
).refine(
  (data) => {
    // Townhouse теперь тоже требует этаж — у двух/трёхэтажных корпусов
    // девелоперу нужно показать брокеру, на каком этаже квартира.
    if (
      data.type !== 'apartment' &&
      data.type !== 'commercial' &&
      data.type !== 'townhouse'
    ) {
      return true;
    }
    if (!data.floor || !data.floor.trim()) return false;
    const n = parseInt(data.floor, 10);
    return Number.isInteger(n) && n > 0 && n <= MAX_FLOOR;
  },
  { message: 'Укажите этаж', path: ['floor'] },
).refine(
  (data) => {
    if (data.type !== 'land') return true;
    return !!data.land_number && data.land_number.trim().length > 0;
  },
  { message: 'Укажите номер участка', path: ['land_number'] },
).refine(
  (data) => {
    // Townhouse адресуется этажом, а не номером дома — поле обязательно
    // только для частных домов.
    if (data.type !== 'house') return true;
    return !!data.house_number && data.house_number.trim().length > 0;
  },
  { message: 'Укажите номер дома', path: ['house_number'] },
);

export type PropertyFormData = z.infer<typeof propertySchema>;

// === Auctions ===

// Draft schema — drafts can omit dates and skip min/length validations.
export const auctionDraftSchema = z.object({
  propertyIds: z
    .array(z.string())
    .min(1, 'Выберите хотя бы один объект'),
  mode: z.string().min(1, 'Выберите тип аукциона'),
  // Стартовая цена — концепция OPEN-аукциона (минимум для первой ставки).
  // В CLOSED брокеры подают запечатанные ставки против собственной оценки,
  // стартовая цена там просто не существует. Поэтому строка может быть
  // пустой; refine ниже требует число только в open-mode.
  min_price: z.string().optional(),
  min_bid_increment: z.string().optional(),
  show_price_to_brokers: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type AuctionDraftFormData = z.infer<typeof auctionDraftSchema>;

export const auctionSchema = z.object({
  propertyIds: z
    .array(z.string())
    .min(1, 'Выберите хотя бы один объект'),
  mode: z.string().min(1, 'Выберите тип аукциона'),
  min_price: z.string().optional(),
  min_bid_increment: z.string().optional(),
  show_price_to_brokers: z.boolean().optional(),
  start_date: z
    .string()
    .min(1, 'Выберите дату начала')
    .refine((v) => {
      if (!v) return true;
      return new Date(v).getTime() >= Date.now();
    }, 'Дата начала должна быть в будущем'),
  end_date: z.string().min(1, 'Выберите дату окончания'),
}).refine(
  (data) => {
    if (data.mode === 'open' && data.propertyIds.length !== 1) return false;
    return true;
  },
  { message: 'Для открытого аукциона нужно выбрать ровно один объект',
    path: ['propertyIds'] },
).refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true;
    const start = new Date(data.start_date).getTime();
    const end = new Date(data.end_date).getTime();
    const ONE_MINUTE_MS = 60 * 1000;
    return end - start >= ONE_MINUTE_MS;
  },
  { message: 'Минимальная длительность аукциона — 1 минута',
    path: ['end_date'] },
).refine(
  (data) => {
    if (data.mode !== 'open') return true;
    if (!data.min_bid_increment || !data.min_bid_increment.trim()) return false;
    return parseFloat(data.min_bid_increment) >= 1;
  },
  { message: 'Введите шаг ставки (минимум 1)',
    path: ['min_bid_increment'] },
).refine(
  (data) => {
    // В open-mode стартовая цена — обязательное поле, минимум первой ставки.
    if (data.mode !== 'open') return true;
    if (!data.min_price || !data.min_price.trim()) return false;
    return parseFloat(data.min_price) > 0;
  },
  { message: 'Введите стартовую цену',
    path: ['min_price'] },
);

export type AuctionFormData = z.infer<typeof auctionSchema>;
