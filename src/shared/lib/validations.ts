import { z } from 'zod';

// === Auth ===

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
  property_class: z.string().min(1, 'Выберите класс'),
  price: z
    .string()
    .min(1, 'Введите цену')
    .refine((v) => parseFloat(v) > 0, 'Цена должна быть больше 0'),
  currency: z.string().min(1, 'Выберите валюту'),
  deadline: z.string().optional(),
  status: z.string().min(1, 'Выберите статус'),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

// === Auctions ===

export const auctionSchema = z.object({
  property_id: z
    .string()
    .min(1, 'Выберите объект'),
  mode: z.string().min(1, 'Выберите тип аукциона'),
  min_price: z
    .string()
    .min(1, 'Введите минимальную цену')
    .refine((v) => parseFloat(v) > 0, 'Цена должна быть больше 0'),
  start_date: z
    .string()
    .min(1, 'Выберите дату начала')
    .refine((v) => {
      if (!v) return true;
      const minTime = Date.now() + 60 * 60 * 1000;
      return new Date(v).getTime() >= minTime;
    }, 'Дата начала должна быть минимум через 1 час от текущего времени'),
  end_date: z.string().min(1, 'Выберите дату окончания'),
}).refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true;
    const start = new Date(data.start_date).getTime();
    const end = new Date(data.end_date).getTime();
    return end >= start + 60 * 60 * 1000; // минимум 1 час разницы
  },
  { message: 'Дата окончания должна быть минимум на 1 час позже даты начала', path: ['end_date'] },
);

export type AuctionFormData = z.infer<typeof auctionSchema>;
