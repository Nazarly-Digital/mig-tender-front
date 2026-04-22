// Translates known English backend error messages to Russian,
// matching the product tone used across the UI.

const EXACT: Record<string, string> = {
  // --- INN validation ---
  "Invalid INN: checksum mismatch for 12-digit INN.":
    "ИНН недействителен: не совпадает контрольная сумма 12-значного номера.",
  "Invalid INN: checksum mismatch for 10-digit INN.":
    "ИНН недействителен: не совпадает контрольная сумма 10-значного номера.",
  "INN must be 10 or 12 digits.":
    "ИНН должен содержать 10 или 12 цифр.",
  "INN must contain only digits.":
    "ИНН должен содержать только цифры.",

  // --- DRF common validation messages ---
  "This field is required.":
    "Это поле обязательно для заполнения.",
  "This field may not be blank.":
    "Это поле не может быть пустым.",
  "This field may not be null.":
    "Это поле не может быть пустым.",
  "Enter a valid email address.":
    "Введите корректный email.",
  "Not a valid email address.":
    "Некорректный email.",
  "A valid integer is required.":
    "Требуется целое число.",
  "A valid number is required.":
    "Требуется корректное число.",
  "Must be a valid boolean.":
    "Значение должно быть логическим (да/нет).",
  "Datetime has wrong format.":
    "Неверный формат даты и времени.",
  "Date has wrong format.":
    "Неверный формат даты.",
  "No file was submitted.":
    "Файл не был отправлен.",
  "The submitted file is empty.":
    "Загруженный файл пуст.",
  "Upload a valid image.":
    "Загрузите корректное изображение.",

  // --- Auth / permissions ---
  "Authentication credentials were not provided.":
    "Учётные данные не были предоставлены.",
  "Invalid token.":
    "Недействительный токен.",
  "Token is invalid or expired.":
    "Токен недействителен или истёк.",
  "You do not have permission to perform this action.":
    "У вас недостаточно прав для этого действия.",
  "Invalid credentials.":
    "Неверный email или пароль.",
  "Invalid password.":
    "Неверный пароль.",
  "User with this email already exists.":
    "Пользователь с таким email уже существует.",
  "A user with that email already exists.":
    "Пользователь с таким email уже существует.",

  // --- Generic ---
  "Not found.":
    "Не найдено.",
  "Invalid page.":
    "Неверная страница.",
  "Server error.":
    "Ошибка сервера.",
  "Internal server error.":
    "Внутренняя ошибка сервера.",
  "Bad request.":
    "Неверный запрос.",
};

const PATTERNS: Array<{ re: RegExp; to: (m: RegExpMatchArray) => string }> = [
  {
    // "Invalid INN: checksum mismatch ..." (any phrasing)
    re: /invalid inn.*checksum/i,
    to: () => "ИНН недействителен: не совпадает контрольная сумма номера.",
  },
  {
    // "Ensure this field has no more than N characters."
    re: /^ensure this field has no more than (\d+) characters?\.?$/i,
    to: (m) => `Поле не может содержать более ${m[1]} символов.`,
  },
  {
    // "Ensure this field has at least N characters."
    re: /^ensure this field has at least (\d+) characters?\.?$/i,
    to: (m) => `Поле должно содержать не менее ${m[1]} символов.`,
  },
  {
    // "Ensure this value is greater than or equal to N."
    re: /^ensure this value is greater than or equal to (-?[\d.,]+)\.?$/i,
    to: (m) => `Значение должно быть не меньше ${m[1]}.`,
  },
  {
    // "Ensure this value is less than or equal to N."
    re: /^ensure this value is less than or equal to (-?[\d.,]+)\.?$/i,
    to: (m) => `Значение должно быть не больше ${m[1]}.`,
  },
  {
    // "Method \"POST\" not allowed."
    re: /^method\s+"?([A-Z]+)"?\s+not allowed\.?$/i,
    to: (m) => `Метод ${m[1]} не разрешён.`,
  },
  {
    // File size limits
    re: /file size.*exceeds/i,
    to: () => "Размер файла превышает допустимый лимит.",
  },
  {
    // Required field (alt phrasing)
    re: /is required$/i,
    to: () => "Поле обязательно для заполнения.",
  },
];

export function translateBackendMessage(message: string): string {
  const trimmed = message.trim();
  if (EXACT[trimmed]) return EXACT[trimmed];
  for (const { re, to } of PATTERNS) {
    const match = trimmed.match(re);
    if (match) return to(match);
  }
  return message;
}
