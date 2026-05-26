'use client';

/**
 * Карточка редактирования профиля в ЛК (broker + developer).
 * Поля: имя, фамилия, ИНН, телефон (+ company_name для developer'а).
 * Для broker'а ниже — загрузка ИНН и Паспорт документов.
 *
 * Используется на /cabinet вместе с VerificationStatusCard.
 *
 * Когда verification_status = IN_REVIEW — поля read-only (по ТЗ:
 * «После отправки вы не сможете редактировать профиль, пока админ
 * не завершит проверку»).
 */

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  RiBuildingLine,
  RiFileTextLine,
  RiMailLine,
  RiPhoneLine,
  RiUploadCloud2Line,
  RiUserLine,
} from '@remixicon/react';

import { useSessionStore } from '@/entities/auth/model/store';
import {
  useDeleteDocument,
  useGetCode,
  useUpdateMe,
  useUploadDocument,
  useVerifyEmail,
  useMe,
} from '@/features/auth';
import { validateInn } from '@/shared/lib/inn';
import {
  formatPhoneInput,
  formatPhoneInputLocked,
  validatePhoneNumber,
} from '@/shared/lib/phone';
import * as DigitInput from '@/shared/ui/digit-input';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as Modal from '@/shared/ui/modal';

type ProfileFields = {
  first_name: string;
  last_name: string;
  email: string;
  inn_number: string;
  phone_number: string;
  company_name: string;
};

// Базовая проверка формата email (для гейта «профиль заполнен» и
// клиентской подсветки; полную валидацию делает бэк).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const READONLY_STATUSES = new Set(['in_review', 'pending']);

// Ref-handle через который родитель (cabinet/page.tsx) может попросить
// карточку сохранить текущие значения. Используется в SubmitForReviewButton:
// один клик «Отправить на проверку» сначала сохраняет профиль, потом
// сабмитит — отдельная кнопка «Сохранить» для not_submitted больше не нужна.
export type ProfileEditCardHandle = {
  save: () => Promise<void>;
};

export const ProfileEditCard = React.forwardRef<
  ProfileEditCardHandle,
  {
    role: 'broker' | 'developer';
    // ТЗ от 2026-05-15 — родитель (cabinet/page.tsx) дизейблит
    // «Отправить на проверку» пока не заполнены ВСЕ поля. Поля живут
    // в локальном стейте этой карточки, поэтому пробрасываем
    // наружу boolean: «у меня всё нужное заполнено».
    onLocalCompleteChange?: (complete: boolean) => void;
  }
>(function ProfileEditCard({ role, onLocalCompleteChange }, ref) {
  useMe(); // чтобы данные были свежие
  const user = useSessionStore((s) => s.user);
  const updateMe = useUpdateMe();
  // ТЗ от 2026-05-16 — смена email требует подтверждения кодом
  // (как при регистрации). getCode шлёт код на НОВЫЙ адрес,
  // verifyEmail подтверждает.
  const getCode = useGetCode();
  const verifyEmail = useVerifyEmail();

  const verificationStatus =
    role === 'broker'
      ? user?.broker?.verification_status ?? 'not_submitted'
      : user?.developer?.verification_status ?? 'not_submitted';
  const readOnly = READONLY_STATUSES.has(verificationStatus);
  // Email редактируется ТОЛЬКО у верифицированного аккаунта (фидбек
  // 2026-05-22). До верификации (not_submitted / rejected / in_review)
  // поле заблокировано: «Отправить на проверку» = проверка документов,
  // а не почты, и саморегистрация/создание админом уже дали валидный
  // адрес. Раньше поле было редактируемым → при смене перед отправкой
  // бэк отбивал «Новый email не подтверждён» (saveProfile минует
  // модалку кода). После верификации смена email — через код (ниже).
  const emailLocked = verificationStatus !== 'accepted';

  const [values, setValues] = React.useState<ProfileFields>({
    first_name: '',
    last_name: '',
    email: '',
    inn_number: '',
    phone_number: '',
    company_name: '',
  });
  // Исходный email (для детекта смены). Обновляется после
  // успешного сохранения. State (не ref) — читается в render
  // для вычисления emailChanged.
  const [originalEmail, setOriginalEmail] = React.useState('');
  // Стейт модалки подтверждения нового email.
  const [emailVerifyOpen, setEmailVerifyOpen] = React.useState(false);
  const [emailCode, setEmailCode] = React.useState('');

  // Подкачиваем актуал из session ТОЛЬКО при первом маунте/смене пользователя.
  // Раньше зависимость [user] триггерила ре-инициализацию каждый раз когда
  // обновлялся snapshot user'а (например после useUploadDocument → invalidate
  // me-query) — в результате локально набранные Имя/Фамилия/ИНН сбрасывались
  // прямо во время заполнения. Теперь синкаем только если поменялся
  // user.id (новая сессия) или мы ещё не инициализировались.
  const lastUserIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!user) return;
    if (lastUserIdRef.current === user.id) return;
    lastUserIdRef.current = user.id;
    setOriginalEmail((user.email ?? '').toLowerCase());
    const rawPhone =
      (user.broker?.phone_number ?? user.developer?.phone_number ?? '') || '';
    setValues({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      inn_number:
        (user.broker?.inn_number ?? user.developer?.inn_number ?? '') || '',
      // ТЗ от 2026-05-15 — отображаем телефон в маске «+7 (999) 999-99-99»
      // вместо «70000000000». На сохранении бэк нормализует обратно.
      phone_number: rawPhone ? formatPhoneInput(rawPhone) : '',
      company_name: user.developer?.company_name ?? '',
    });
  }, [user]);

  // Внутренний save: отправляет PATCH /me/, возвращает Promise.
  // Используется и кнопкой «Сохранить» (для accepted), и
  // SubmitForReviewButton (через ref) — чтобы один клик «Отправить
  // на проверку» сохранял профиль перед сабмитом.
  const saveProfile = React.useCallback(async () => {
    const payload: Partial<ProfileFields> = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      // email — бэк нормализует в lowercase сам, но шлём уже trimmed.
      email: values.email.trim(),
      inn_number: values.inn_number.trim(),
      phone_number: values.phone_number.trim(),
    };
    if (role === 'developer') {
      payload.company_name = values.company_name.trim();
    } else {
      delete payload.company_name;
    }
    if (!payload.inn_number) delete payload.inn_number;
    if (!payload.email) delete payload.email;
    await updateMe.mutateAsync(payload);
  }, [values, role, updateMe]);

  // Достаёт человекочитаемую ошибку из ответа бэка.
  const apiError = (e: unknown): string => {
    const err = e as {
      response?: { data?: Record<string, unknown> | { detail?: string } };
    };
    const data = err.response?.data;
    if (!data) return 'Не удалось сохранить профиль';
    if (typeof (data as { detail?: string }).detail === 'string') {
      return (data as { detail: string }).detail;
    }
    const firstField = Object.keys(data)[0];
    if (!firstField) return 'Не удалось сохранить профиль';
    const v = (data as Record<string, unknown>)[firstField];
    return Array.isArray(v) ? (v as string[]).join(', ') : String(v);
  };

  // Прямое сохранение профиля (email уже подтверждён либо не менялся).
  const doSave = async () => {
    try {
      await saveProfile();
      setOriginalEmail(values.email.trim().toLowerCase());
      toast.success('Профиль обновлён');
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const emailChanged =
    values.email.trim().toLowerCase() !== originalEmail;

  const handleSave = async () => {
    // ТЗ от 2026-05-16 — если email изменился, перед сохранением
    // подтверждаем его кодом (код уходит на новый адрес).
    if (emailChanged) {
      const newEmail = values.email.trim().toLowerCase();
      if (!EMAIL_RE.test(newEmail)) {
        toast.error('Введите корректный email');
        return;
      }
      try {
        await getCode.mutateAsync({ email: newEmail });
        setEmailCode('');
        setEmailVerifyOpen(true);
      } catch (e) {
        toast.error(apiError(e));
      }
      return;
    }
    await doSave();
  };

  // Подтверждение кода из модалки → verify-email → сохранение.
  const handleEmailVerify = async () => {
    const newEmail = values.email.trim().toLowerCase();
    try {
      await verifyEmail.mutateAsync({ email: newEmail, code: emailCode });
      setEmailVerifyOpen(false);
      setEmailCode('');
      await doSave();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  // Экспонируем save() наружу — родитель сможет дёрнуть его
  // программно (один клик «Отправить на проверку» = save + submit).
  React.useImperativeHandle(
    ref,
    () => ({ save: saveProfile }),
    [saveProfile],
  );

  // ИНН: developer (юр.лицо) — 10 цифр, broker (физлицо) — 12.
  const innExpectedLen: 10 | 12 = role === 'developer' ? 10 : 12;
  // Inline-ошибка ИНН (фидбек 2026-05-26): единое сообщение «Введен
  // некорректный ИНН» для любого случая — недобор цифр, перебор,
  // нечисловые символы, неверная контрольная цифра. Раньше показывали
  // только когда длина ровно 10/12 и валидация падала, из-за чего
  // «534535» (6 цифр) висел без ошибки.
  // Пустую строку не подсвечиваем — поле просто ещё не заполнено.
  const innError = React.useMemo(() => {
    const v = values.inn_number.trim();
    if (!v) return null;
    return validateInn(v, innExpectedLen) === null
      ? null
      : 'Введен некорректный ИНН';
  }, [values.inn_number, innExpectedLen]);

  // Inline-ошибка телефона — единое правило с регистрацией и бэком
  // (validatePhoneNumber). Показываем когда введено ≥ 11 цифр.
  const phoneError = React.useMemo(() => {
    if (values.phone_number.replace(/\D/g, '').length < 11) return null;
    return validatePhoneNumber(values.phone_number);
  }, [values.phone_number]);

  // Полнота локальных полей — родитель использует чтобы дизейблить
  // «Отправить на проверку» пока что-то не заполнено.
  const isLocallyComplete = React.useMemo(() => {
    const required =
      !!values.first_name.trim() &&
      !!values.last_name.trim() &&
      EMAIL_RE.test(values.email.trim()) &&
      // ИНН — ровно нужная длина И валидная контрольная цифра.
      values.inn_number.trim().length === innExpectedLen &&
      validateInn(values.inn_number.trim(), innExpectedLen) === null &&
      // Phone: с маской «+7 (» считается пустым; формат — validatePhoneNumber.
      !!values.phone_number.trim() &&
      values.phone_number.replace(/\D/g, '').length >= 11 &&
      validatePhoneNumber(values.phone_number) === null;
    if (role === 'developer') {
      return required && !!values.company_name.trim();
    }
    return required;
  }, [values, role, innExpectedLen]);
  React.useEffect(() => {
    onLocalCompleteChange?.(isLocallyComplete);
  }, [isLocallyComplete, onLocalCompleteChange]);

  return (
    <div className='mt-6 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
      <div className='flex items-center gap-2'>
        <span className='text-[14px] font-semibold text-gray-900'>
          Данные аккаунта
        </span>
      </div>

      {/* Сетка 2-в-ряд (фидбек 2026-05-16). Порядок полей:
          Имя | Фамилия / ИНН | Название компании / Email | Телефон.
          У broker'а нет company_name → Email | Телефон во 2-м ряду. */}
      <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <Label.Root htmlFor='first_name'>Имя</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiUserLine} />
              <Input.Input
                id='first_name'
                disabled={readOnly}
                placeholder='Иван'
                value={values.first_name}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    // Только буквы (RU/EN), пробел и дефис.
                    first_name: e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, ''),
                  }))
                }
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root htmlFor='last_name'>Фамилия</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiUserLine} />
              <Input.Input
                id='last_name'
                disabled={readOnly}
                placeholder='Иванов'
                value={values.last_name}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    last_name: e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, ''),
                  }))
                }
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root htmlFor='inn_number'>ИНН</Label.Root>
          <Input.Root hasError={!!innError}>
            <Input.Wrapper>
              <Input.Icon as={RiFileTextLine} />
              <Input.Input
                id='inn_number'
                disabled={readOnly}
                // developer (юр.лицо) — 10 цифр, broker (физлицо) — 12.
                placeholder={`${innExpectedLen} цифр`}
                inputMode='numeric'
                maxLength={innExpectedLen}
                value={values.inn_number}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    inn_number: e.target.value
                      .replace(/\D/g, '')
                      .slice(0, innExpectedLen),
                  }))
                }
              />
            </Input.Wrapper>
          </Input.Root>
          {/* Inline-ошибка ИНН — checksum/формат проверяется сразу
              после ввода нужного кол-ва цифр (фидбек 2026-05-16). */}
          {innError && (
            <p className='mt-1 text-[12px] text-red-600'>{innError}</p>
          )}
        </div>

        {role === 'developer' && (
          <div>
            <Label.Root htmlFor='company_name'>Название компании</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiBuildingLine} />
                <Input.Input
                  id='company_name'
                  disabled={readOnly}
                  placeholder='ООО «Пример»'
                  value={values.company_name}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, company_name: e.target.value }))
                  }
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        )}

        <div>
          <Label.Root htmlFor='email'>Email</Label.Root>
          <Input.Root hasError={!!values.email.trim() && !EMAIL_RE.test(values.email.trim())}>
            <Input.Wrapper>
              <Input.Icon as={RiMailLine} />
              <Input.Input
                id='email'
                type='email'
                disabled={readOnly || emailLocked}
                placeholder='example@mail.com'
                value={values.email}
                onChange={(e) =>
                  setValues((v) => ({ ...v, email: e.target.value }))
                }
              />
            </Input.Wrapper>
          </Input.Root>
          {!!values.email.trim() && !EMAIL_RE.test(values.email.trim()) && (
            <p className='mt-1 text-[12px] text-red-600'>
              Введите корректный email
            </p>
          )}
          {/* Подсказка только для незаблокированного-по-«на проверке»
              состояния (not_submitted / rejected) — у in_review/pending
              уже есть общий баннер «профиль на проверке». */}
          {emailLocked && !readOnly && (
            <p className='mt-1 text-[12px] text-gray-500'>
              Сменить email можно после верификации профиля.
            </p>
          )}
        </div>

        <div>
          <Label.Root htmlFor='phone_number'>Номер телефона</Label.Root>
          <Input.Root hasError={!!phoneError}>
            <Input.Wrapper>
              <Input.Icon as={RiPhoneLine} />
              <Input.Input
                id='phone_number'
                disabled={readOnly}
                inputMode='tel'
                value={values.phone_number}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    phone_number: formatPhoneInputLocked(e.target.value),
                  }))
                }
              />
            </Input.Wrapper>
          </Input.Root>
          {phoneError && (
            <p className='mt-1 text-[12px] text-red-600'>{phoneError}</p>
          )}
        </div>
      </div>

      {/* «Сохранить» нужен только тем кто УЖЕ верифицирован — могут
          обновить ФИО/телефон без повторной проверки. У not_submitted
          единая кнопка «Отправить на проверку» внизу страницы делает
          и save, и submit (по фидбеку 2026-05-15). */}
      {!readOnly && verificationStatus === 'accepted' && (
        <div className='mt-4 flex justify-end'>
          <FancyButton.Root
            variant='primary'
            size='small'
            disabled={updateMe.isPending || getCode.isPending}
            onClick={handleSave}
          >
            {updateMe.isPending || getCode.isPending
              ? 'Сохранение…'
              : 'Сохранить'}
          </FancyButton.Root>
        </div>
      )}

      {/* Модалка подтверждения нового email кодом (ТЗ 2026-05-16).
          Код приходит на новый адрес — как при регистрации. */}
      <Modal.Root open={emailVerifyOpen} onOpenChange={setEmailVerifyOpen}>
        <Modal.Content className='max-w-[440px]'>
          <Modal.Header
            title='Подтвердите новый email'
            description={`Мы отправили код на ${values.email.trim().toLowerCase()}. Введите его, чтобы сменить email.`}
          />
          <Modal.Body>
            <div className='flex flex-col gap-1.5'>
              <Label.Root>Код из письма</Label.Root>
              <DigitInput.Root
                value={emailCode}
                onChange={setEmailCode}
                numInputs={6}
                inputType='number'
                shouldAutoFocus
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <FancyButton.Root variant='basic' size='small'>
                Отмена
              </FancyButton.Root>
            </Modal.Close>
            <FancyButton.Root
              variant='primary'
              size='small'
              disabled={emailCode.length < 6 || verifyEmail.isPending}
              onClick={handleEmailVerify}
            >
              {verifyEmail.isPending ? 'Проверка…' : 'Подтвердить'}
            </FancyButton.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {readOnly && (
        <p className='mt-3 text-[12px] text-gray-500'>
          Профиль на проверке у администратора — поля заблокированы.
        </p>
      )}

      {/* ТЗ от 2026-05-14 — developer проходит верификацию по тем же
          доками (ИНН + паспорт), что и broker. Блок одинаковый. */}
      <UserDocsBlock readOnly={readOnly} />
    </div>
  );
});

function UserDocsBlock({ readOnly }: { readOnly: boolean }) {
  const user = useSessionStore((s) => s.user);
  const upload = useUploadDocument();
  const deleteDoc = useDeleteDocument();

  const innDoc = user?.documents?.find((d) => d.doc_type === 'inn') ?? null;
  const passportDoc =
    user?.documents?.find((d) => d.doc_type === 'passport') ?? null;

  const innRef = React.useRef<HTMLInputElement>(null);
  const passportRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (
    docType: 'inn' | 'passport',
    file: File | undefined,
    existingId: number | null,
  ) => {
    if (!file) return;
    try {
      // Если уже есть документ этого типа — backend на UniqueConstraint
      // ругнётся. Сначала удаляем старый.
      if (existingId) {
        await deleteDoc.mutateAsync(existingId);
      }
      await upload.mutateAsync({
        doc_type: docType,
        document: file,
        document_name: file.name,
      });
      toast.success(`Документ загружен: ${docType === 'inn' ? 'ИНН' : 'Паспорт'}`);
    } catch {
      toast.error('Не удалось загрузить документ');
    }
  };

  return (
    <div className='mt-5 border-t border-blue-50 pt-4'>
      <div className='text-[14px] font-semibold text-gray-900 mb-3'>
        Документы
      </div>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <DocSlot
          label='Документ ИНН'
          existingDoc={innDoc}
          inputRef={innRef}
          disabled={readOnly}
          loading={upload.isPending || deleteDoc.isPending}
          onSelect={(file) =>
            handleUpload('inn', file, innDoc ? innDoc.id : null)
          }
        />
        <DocSlot
          label='Паспорт'
          existingDoc={passportDoc}
          inputRef={passportRef}
          disabled={readOnly}
          loading={upload.isPending || deleteDoc.isPending}
          onSelect={(file) =>
            handleUpload('passport', file, passportDoc ? passportDoc.id : null)
          }
        />
      </div>
    </div>
  );
}

function DocSlot({
  label,
  existingDoc,
  inputRef,
  disabled,
  loading,
  onSelect,
}: {
  label: string;
  existingDoc: { id: number; document_name: string; url: string } | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  loading: boolean;
  onSelect: (file: File | undefined) => void;
}) {
  return (
    <div className='rounded-lg border border-blue-50 bg-white p-3'>
      <div className='text-[12px] font-semibold text-gray-700'>{label}</div>
      {existingDoc ? (
        <div className='mt-2 flex items-center justify-between gap-2'>
          {/* Скачивание через временный `<a>` — `window.open` ловил
              блокировщики попапов, и в каких-то комбинациях
              (Chrome + auth-redirect на 401) это превращалось в
              навигацию по текущей вкладке на /register. Программный
              клик по динамическому anchor стабильнее и не светит
              URL в status-bar (button — visible element, anchor
              живёт долю миллисекунды и сразу удаляется). */}
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!existingDoc.url) {
                toast.error('Документ недоступен');
                return;
              }
              const a = document.createElement('a');
              a.href = existingDoc.url;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className='truncate text-left text-[13px] text-blue-600 hover:underline cursor-pointer'
          >
            {existingDoc.document_name || 'Документ'}
          </button>
          {!disabled && (
            <FancyButton.Root
              variant='basic'
              size='small'
              disabled={loading}
              onClick={() => inputRef.current?.click()}
            >
              Заменить
            </FancyButton.Root>
          )}
        </div>
      ) : (
        <div className='mt-2'>
          {disabled ? (
            <p className='text-[12px] text-gray-400'>Не загружен</p>
          ) : (
            <FancyButton.Root
              variant='basic'
              size='small'
              disabled={loading}
              onClick={() => inputRef.current?.click()}
            >
              <RiUploadCloud2Line className='size-4' />
              Загрузить
            </FancyButton.Root>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type='file'
        accept='application/pdf,image/*'
        className='hidden'
        onChange={(e) => onSelect(e.target.files?.[0])}
      />
    </div>
  );
}
