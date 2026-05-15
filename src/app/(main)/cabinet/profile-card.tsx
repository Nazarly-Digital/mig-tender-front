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
  RiPhoneLine,
  RiUploadCloud2Line,
  RiUserLine,
} from '@remixicon/react';

import { useSessionStore } from '@/entities/auth/model/store';
import {
  useDeleteDocument,
  useUpdateMe,
  useUploadDocument,
  useMe,
} from '@/features/auth';
import { formatPhoneInputLocked } from '@/shared/lib/phone';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';

type ProfileFields = {
  first_name: string;
  last_name: string;
  inn_number: string;
  phone_number: string;
  company_name: string;
};

const READONLY_STATUSES = new Set(['in_review', 'pending']);

export function ProfileEditCard({ role }: { role: 'broker' | 'developer' }) {
  useMe(); // чтобы данные были свежие
  const user = useSessionStore((s) => s.user);
  const updateMe = useUpdateMe();

  const verificationStatus =
    role === 'broker'
      ? user?.broker?.verification_status ?? 'not_submitted'
      : user?.developer?.verification_status ?? 'not_submitted';
  const readOnly = READONLY_STATUSES.has(verificationStatus);

  const [values, setValues] = React.useState<ProfileFields>({
    first_name: '',
    last_name: '',
    inn_number: '',
    phone_number: '',
    company_name: '',
  });

  // Подкачиваем актуал из session при изменениях user'а.
  React.useEffect(() => {
    setValues({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      inn_number:
        (user?.broker?.inn_number ?? user?.developer?.inn_number ?? '') || '',
      phone_number:
        (user?.broker?.phone_number ?? user?.developer?.phone_number ?? '') ||
        '',
      company_name: user?.developer?.company_name ?? '',
    });
  }, [user]);

  const handleSave = async () => {
    const payload: Partial<ProfileFields> = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      inn_number: values.inn_number.trim(),
      phone_number: values.phone_number.trim(),
    };
    if (role === 'developer') {
      payload.company_name = values.company_name.trim();
    } else {
      // broker: не шлём company_name — оно для developer'а.
      delete payload.company_name;
    }
    // Не шлём пустой inn_number — бэк не разрешает blank.
    if (!payload.inn_number) delete payload.inn_number;

    try {
      await updateMe.mutateAsync(payload);
      toast.success('Профиль обновлён');
    } catch (e) {
      const err = e as { response?: { data?: Record<string, unknown> } };
      const data = err.response?.data;
      const firstField = data ? Object.keys(data)[0] : undefined;
      const firstMsg =
        firstField && data
          ? Array.isArray(data[firstField])
            ? (data[firstField] as string[]).join(', ')
            : String(data[firstField])
          : 'Не удалось сохранить профиль';
      toast.error(firstMsg);
    }
  };

  return (
    <div className='mt-6 rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5'>
      <div className='flex items-center gap-2'>
        <span className='text-[14px] font-semibold text-gray-900'>
          Данные аккаунта
        </span>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <Label.Root htmlFor='first_name'>Имя</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiUserLine} />
              <Input.Input
                id='first_name'
                disabled={readOnly}
                value={values.first_name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, first_name: e.target.value }))
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
                value={values.last_name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, last_name: e.target.value }))
                }
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root htmlFor='inn_number'>ИНН</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiFileTextLine} />
              <Input.Input
                id='inn_number'
                disabled={readOnly}
                placeholder='12 цифр'
                inputMode='numeric'
                maxLength={12}
                value={values.inn_number}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    inn_number: e.target.value.replace(/\D/g, ''),
                  }))
                }
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <Label.Root htmlFor='phone_number'>Номер телефона</Label.Root>
          <Input.Root>
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
        </div>

        {role === 'developer' && (
          <div className='sm:col-span-2'>
            <Label.Root htmlFor='company_name'>Название компании</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiBuildingLine} />
                <Input.Input
                  id='company_name'
                  disabled={readOnly}
                  value={values.company_name}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, company_name: e.target.value }))
                  }
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className='mt-4 flex justify-end'>
          <FancyButton.Root
            variant='primary'
            size='small'
            disabled={updateMe.isPending}
            onClick={handleSave}
          >
            {updateMe.isPending ? 'Сохранение…' : 'Сохранить'}
          </FancyButton.Root>
        </div>
      )}

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
}

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
          <a
            href={existingDoc.url}
            target='_blank'
            rel='noopener noreferrer'
            className='truncate text-[13px] text-blue-600 hover:underline'
          >
            {existingDoc.document_name || 'Документ'}
          </a>
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
