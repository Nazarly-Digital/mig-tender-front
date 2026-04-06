import { z } from 'zod';

// === Auth ===

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Введите email')
    .transform((v) => v.replace(/\s/g, ''))
    .pipe(z.string().email('Введите корректный email')),
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const emailStepSchema = z.object({
  email: z
    .string()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
});

export type EmailStepFormData = z.infer<typeof emailStepSchema>;

export const brokerRegisterSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    innNumber: z
      .string()
      .min(1, 'Введите ИНН номер'),
    phoneNumber: z
      .string()
      .min(1, 'Введите номер телефона'),
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(8, 'Пароль должен содержать минимум 8 символов'),
    passwordConfirm: z
      .string()
      .min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  });

export type BrokerRegisterFormData = z.infer<typeof brokerRegisterSchema>;

export const developerRegisterSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z
      .string()
      .min(1, 'Введите название компании'),
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(8, 'Пароль должен содержать минимум 8 символов'),
    passwordConfirm: z
      .string()
      .min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  });

export type DeveloperRegisterFormData = z.infer<typeof developerRegisterSchema>;

// === Properties ===

export const propertySchema = z.object({
  type: z.string().min(1, 'Выберите тип'),
  address: z.string().min(1, 'Введите адрес'),
  area: z
    .string()
    .min(1, 'Введите площадь')
    .refine((v) => parseFloat(v) > 0, 'Площадь должна быть больше 0'),
  property_class: z.string().optional(),
  price: z
    .string()
    .min(1, 'Введите цену')
    .refine((v) => parseFloat(v) > 0, 'Цена должна быть больше 0'),
  currency: z.string().min(1),
  deadline: z.string().optional(),
  commission_rate: z.string().optional().refine(
    (v) => !v || parseFloat(v) >= 0,
    'Комиссия должна быть >= 0',
  ),
  status: z.string().min(1, 'Выберите статус'),
  floor: z.string().optional(),
  developer_name: z.string().min(1, 'Введите название застройщика'),
  project: z.string().min(1, 'Введите название проекта'),
  land_number: z.string().optional(),
  house_number: z.string().optional(),
}).refine(
  (data) => data.type === 'land' || (data.property_class && data.property_class.length > 0),
  { message: 'Выберите класс', path: ['property_class'] },
).refine(
  (data) => {
    if (data.type !== 'apartment' && data.type !== 'commercial') return true;
    if (!data.floor || !data.floor.trim()) return false;
    return parseInt(data.floor) > 0;
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
    if (data.type !== 'house' && data.type !== 'townhouse') return true;
    return !!data.house_number && data.house_number.trim().length > 0;
  },
  { message: 'Укажите номер дома', path: ['house_number'] },
);

export type PropertyFormData = z.infer<typeof propertySchema>;

// === Auctions ===

export const auctionSchema = z.object({
  propertyIds: z
    .array(z.string())
    .min(1, 'Выберите хотя бы один объект'),
  mode: z.string().min(1, 'Выберите тип аукциона'),
  min_price: z
    .string()
    .min(1, 'Введите минимальную цену')
    .refine((v) => parseFloat(v) > 0, 'Цена должна быть больше 0'),
  min_bid_increment: z.string().optional(),
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
    return end > start;
  },
  { message: 'Дата окончания должна быть позже даты начала',
    path: ['end_date'] },
).refine(
  (data) => {
    if (data.mode !== 'open') return true;
    if (!data.min_bid_increment || !data.min_bid_increment.trim()) return false;
    return parseFloat(data.min_bid_increment) >= 1;
  },
  { message: 'Введите шаг ставки (минимум 1)',
    path: ['min_bid_increment'] },
);

export type AuctionFormData = z.infer<typeof auctionSchema>;
