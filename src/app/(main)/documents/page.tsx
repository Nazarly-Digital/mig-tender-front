'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  File01Icon,
  Upload04Icon,
  PencilEdit01Icon,
  Download01Icon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

import { PageHeader } from '@/shared/components/page-header';
import { TableSkeleton } from '@/shared/components/skeletons';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import * as Select from '@/shared/ui/select';
import * as Input from '@/shared/ui/input';
import * as Label from '@/shared/ui/label';
import * as FileFormatIcon from '@/shared/ui/file-format-icon';
import { useMe, useUploadDocument, useUpdateDocumentName } from '@/features/auth';
import { useSessionStore, isUserBroker } from '@/entities/auth/model/store';
import type { UserDocument } from '@/shared/types/auth';

// --- Helpers ---

const DOC_TYPE_LABELS: Record<string, string> = {
  inn: 'ИНН',
  passport: 'Паспорт',
  others: 'Другое',
};

function getExtensionColor(ext: string): 'red' | 'blue' | 'gray' | 'green' {
  const e = ext.replace('.', '').toLowerCase();
  if (e === 'pdf') return 'red';
  if (['doc', 'docx'].includes(e)) return 'blue';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(e)) return 'green';
  return 'gray';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { error?: string; detail?: string; message?: string } } };
  return err.response?.data?.error ?? err.response?.data?.detail ?? err.response?.data?.message ?? 'Произошла ошибка';
}

// --- Required Document Card (INN / Passport) ---

function RequiredDocCard({
  title,
  description,
  docType,
  document,
}: {
  title: string;
  description: string;
  docType: 'inn' | 'passport';
  document: UserDocument | undefined;
}) {
  const uploadDocument = useUploadDocument();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    uploadDocument.mutate(
      { doc_type: docType, document: file },
      {
        onSuccess: () => toast.success(`${title} загружен`),
        onError: (error) => toast.error(getApiError(error)),
      },
    );
  };

  const isUploaded = !!document;

  return (
    <div className='rounded-xl border border-gray-200 bg-white'>
      {/* Header */}
      <div className='flex items-start justify-between p-5'>
        <div className='flex items-start gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50'>
            <HugeiconsIcon icon={File01Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-blue-600' />
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-900'>{title}</p>
            <p className='mt-0.5 text-[12px] text-gray-500'>{description}</p>
          </div>
        </div>
        {isUploaded ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700'>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color='currentColor' strokeWidth={2} />
            Загружен
          </span>
        ) : (
          <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500'>
            <HugeiconsIcon icon={InformationCircleIcon} size={12} color='currentColor' strokeWidth={2} />
            Не загружен
          </span>
        )}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between border-t border-gray-100 px-5 py-3'>
        <span className='text-[13px] font-medium text-gray-700'>{title}</span>
        <div className='flex items-center gap-2'>
          {isUploaded ? (
            <a href={document.url} target='_blank' rel='noopener noreferrer'>
              <FancyButton.Root variant='basic' size='xsmall'>
                <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                Скачать
              </FancyButton.Root>
            </a>
          ) : (
            <>
              <FancyButton.Root
                variant='basic'
                size='xsmall'
                onClick={() => inputRef.current?.click()}
                disabled={uploadDocument.isPending}
              >
                <HugeiconsIcon icon={Upload04Icon} size={14} color='currentColor' strokeWidth={1.5} />
                {uploadDocument.isPending ? 'Загрузка...' : 'Загрузить'}
              </FancyButton.Root>
              <input
                ref={inputRef}
                type='file'
                className='hidden'
                accept='.pdf,.jpg,.jpeg,.png,.webp,image/*'
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Upload Modal (for "others" docs only) ---

function UploadDocumentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const uploadDocument = useUploadDocument();
  const [documentName, setDocumentName] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setDocumentName('');
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Выберите файл');
      return;
    }

    uploadDocument.mutate(
      {
        doc_type: 'others',
        document: file,
        ...(documentName.trim() && { document_name: documentName.trim() }),
      },
      {
        onSuccess: () => {
          toast.success('Документ загружен');
          resetForm();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  };

  return (
    <Modal.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <Modal.Content>
        <Modal.Header title='Загрузить документ' description='Загрузите дополнительный документ' />
        <Modal.Body>
          <div className='space-y-4'>
            {/* Document Name */}
            <div className='space-y-1.5'>
              <Label.Root>Название документа</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    placeholder='Необязательное название'
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            {/* File Input */}
            <div className='space-y-1.5'>
              <Label.Root>
                Файл
                <Label.Asterisk />
              </Label.Root>
              <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3.5 text-sm transition-colors hover:border-blue-400 hover:bg-blue-50/50'
              >
                <HugeiconsIcon icon={Upload04Icon} size={20} color='currentColor' strokeWidth={1.5} className='shrink-0 text-gray-400' />
                <span className='truncate text-gray-500'>
                  {file ? file.name : 'Выберите файл (PDF, JPG, PNG)'}
                </span>
                <input
                  ref={inputRef}
                  type='file'
                  className='hidden'
                  accept='.pdf,.jpg,.jpeg,.png,.webp,image/*'
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </button>
            </div>
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
            onClick={handleUpload}
            disabled={uploadDocument.isPending || !file}
          >
            {uploadDocument.isPending ? 'Загрузка...' : 'Загрузить'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Rename Modal ---

function RenameDocumentModal({
  document,
  open,
  onOpenChange,
}: {
  document: UserDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateName = useUpdateDocumentName();
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (document) setName(document.document_name);
  }, [document]);

  if (!document) return null;

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Введите название');
      return;
    }

    updateName.mutate(
      { document_id: document.id, document_name: name.trim() },
      {
        onSuccess: () => {
          toast.success('Название обновлено');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiError(error));
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header title='Переименовать документ' description={DOC_TYPE_LABELS[document.doc_type] ?? document.doc_type} />
        <Modal.Body>
          <div className='space-y-1.5'>
            <Label.Root>Новое название</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Введите название'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
              </Input.Wrapper>
            </Input.Root>
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
            onClick={handleSave}
            disabled={updateName.isPending || !name.trim()}
          >
            {updateName.isPending ? 'Сохранение...' : 'Сохранить'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Main Page ---

export default function DocumentsPage() {
  const { data: me, isLoading } = useMe();
  const user = useSessionStore((s) => s.user);
  const isBroker = isUserBroker(user);
  const documents = me?.documents ?? [];

  const innDoc = documents.find((d) => d.doc_type === 'inn');
  const passportDoc = documents.find((d) => d.doc_type === 'passport');
  const otherDocs = documents.filter((d) => d.doc_type === 'others');

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<UserDocument | null>(null);

  if (isLoading) {
    return (
      <div className='w-full px-8 py-8'>
        <PageHeader title='Документы' description='Управляйте вашими документами' />
        <div className='mt-6'>
          <TableSkeleton rows={4} cols={4} />
        </div>
      </div>
    );
  }

  return (
    <div className='w-full px-8 py-8'>
      <PageHeader title='Документы' description='Управляйте вашими документами' />

      {/* Required Documents — INN & Passport (broker only) */}
      {isBroker && (
        <div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <RequiredDocCard
            title='ИНН'
            description='Свидетельство о регистрации ИНН'
            docType='inn'
            document={innDoc}
          />
          <RequiredDocCard
            title='Паспорт'
            description='Копия паспорта (главная страница)'
            docType='passport'
            document={passportDoc}
          />
        </div>
      )}

      {/* Other Documents */}
      <div className={isBroker ? 'mt-8' : 'mt-6'}>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>Другие документы</h2>
          <FancyButton.Root variant='primary' size='small' onClick={() => setUploadOpen(true)}>
            <HugeiconsIcon icon={Upload04Icon} size={16} color='currentColor' strokeWidth={1.5} />
            Загрузить
          </FancyButton.Root>
        </div>

        {otherDocs.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-2 py-16'>
            <div className='flex size-11 items-center justify-center rounded-xl bg-gray-50'>
              <HugeiconsIcon icon={File01Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
            </div>
            <p className='mt-1 text-sm font-medium text-gray-900'>Нет дополнительных документов</p>
            <p className='text-[13px] text-gray-500'>Загрузите документ при необходимости</p>
          </div>
        ) : (
          <div className='mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-gray-50/50'>
                  <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                    Документ
                  </th>
                  <th className='px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                    Дата загрузки
                  </th>
                  <th className='px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className='border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/50'
                  >
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-3'>
                        <FileFormatIcon.Root
                          format={doc.extension.replace('.', '').toUpperCase()}
                          color={getExtensionColor(doc.extension)}
                          size='small'
                        />
                        <div className='min-w-0'>
                          <p className='truncate text-[13px] font-medium text-gray-900'>
                            {doc.document_name || doc.filename}
                          </p>
                          <p className='truncate text-[12px] text-gray-400'>
                            {doc.filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-5 py-3.5'>
                      <span className='text-[13px] text-gray-500'>
                        {formatDate(doc.created_at)}
                      </span>
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <FancyButton.Root variant='basic' size='xsmall' onClick={() => setRenameTarget(doc)}>
                          <HugeiconsIcon icon={PencilEdit01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                          Переименовать
                        </FancyButton.Root>
                        <a href={doc.url} target='_blank' rel='noopener noreferrer'>
                          <FancyButton.Root variant='basic' size='xsmall'>
                            <HugeiconsIcon icon={Download01Icon} size={14} color='currentColor' strokeWidth={1.5} />
                            Скачать
                          </FancyButton.Root>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadDocumentModal open={uploadOpen} onOpenChange={setUploadOpen} />
      <RenameDocumentModal
        document={renameTarget}
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      />
    </div>
  );
}
