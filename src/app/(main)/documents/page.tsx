'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CloudUploadIcon,
  File01Icon,
  Cancel01Icon,
  Pdf01Icon,
  Image01Icon,
  ArrowDown01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Cancel02Icon,
  Edit02Icon,
} from '@hugeicons/core-free-icons';
import toast from 'react-hot-toast';

import { cn } from '@/shared/lib/cn';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import { PageHeader } from '@/shared/components/page-header';
import { useMe, useUploadBrokerDocuments, useUpdateDocumentNames } from '@/features/auth';

type DocSlot = 'inn' | 'passport';

const DOC_LABELS: Record<DocSlot, string> = {
  inn: 'ИНН',
  passport: 'Паспорт',
};

const DOC_DESCRIPTIONS: Record<DocSlot, string> = {
  inn: 'Свидетельство о регистрации ИНН',
  passport: 'Копия паспорта (главная страница)',
};

function getVerificationBadge(status: string | undefined) {
  switch (status) {
    case 'verified':
      return {
        label: 'Подтверждён',
        className: 'bg-emerald-50 text-emerald-700',
        icon: CheckmarkCircle01Icon,
      };
    case 'rejected':
      return {
        label: 'Отклонён',
        className: 'bg-red-50 text-red-700',
        icon: Cancel02Icon,
      };
    case 'pending':
      return {
        label: 'На проверке',
        className: 'bg-amber-50 text-amber-700',
        icon: Clock01Icon,
      };
    default:
      return {
        label: 'Не загружен',
        className: 'bg-gray-100 text-gray-600',
        icon: Clock01Icon,
      };
  }
}

function UploadModal({
  open,
  onClose,
  slot,
  onUpload,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  slot: DocSlot;
  onUpload: (file: File) => void;
  isLoading: boolean;
}) {
  const [dragging, setDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = '';
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    onUpload(selectedFile);
  };

  const handleClose = () => {
    if (isLoading) return;
    setSelectedFile(null);
    onClose();
  };

  // Reset file when modal opens
  React.useEffect(() => {
    if (open) setSelectedFile(null);
  }, [open]);

  return (
    <Modal.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header className='pr-5'>
          <div className='flex flex-1 items-start justify-between gap-3'>
            <div>
              <Modal.Title>Загрузить {DOC_LABELS[slot]}</Modal.Title>
              <Modal.Description>{DOC_DESCRIPTIONS[slot]}</Modal.Description>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='space-y-4'>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-all duration-150',
              dragging
                ? 'border-gray-400 bg-gray-50'
                : 'border-gray-200 hover:border-gray-400',
            )}
          >
            <HugeiconsIcon icon={CloudUploadIcon} size={24} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
            <div className='space-y-1'>
              <p className='text-[13px] font-medium text-gray-900'>
                Перетащите файл сюда
              </p>
              <p className='text-[12px] text-gray-400'>
                или нажмите, чтобы выбрать файл
              </p>
            </div>
            <p className='text-[12px] text-gray-400'>
              PDF, PNG, JPG — до 50 МБ
            </p>
            <input
              ref={inputRef}
              type='file'
              accept='.pdf,.png,.jpg,.jpeg,.webp'
              className='hidden'
              onChange={handleFileChange}
            />
          </div>

          {selectedFile && (
            <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50'>
                <HugeiconsIcon
                  icon={selectedFile.type.includes('pdf') ? Pdf01Icon : Image01Icon}
                  size={16}
                  color='currentColor'
                  strokeWidth={1.5}
                  className={selectedFile.type.includes('pdf') ? 'text-red-600' : 'text-purple-600'}
                />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-[13px] font-medium text-gray-900'>
                  {selectedFile.name}
                </p>
                <p className='text-[12px] text-gray-400'>
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className='text-gray-400 hover:text-gray-600 transition-colors'
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color='currentColor' strokeWidth={1.5} />
              </button>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <FancyButton.Root variant='basic' size='small' onClick={handleClose} disabled={isLoading}>
            Отмена
          </FancyButton.Root>
          <FancyButton.Root
            variant='primary'
            size='small'
            disabled={!selectedFile || isLoading}
            onClick={handleUpload}
          >
            {isLoading ? 'Загрузка...' : 'Загрузить'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function DocumentCard({
  slot,
  name,
  url,
  verificationStatus,
  onUpload,
}: {
  slot: DocSlot;
  name?: string;
  url?: string;
  verificationStatus?: string;
  onUpload: () => void;
}) {
  const hasDocument = !!url;
  const badge = getVerificationBadge(hasDocument ? verificationStatus : undefined);

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-4'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            hasDocument ? 'bg-blue-50' : 'bg-gray-100',
          )}>
            <HugeiconsIcon
              icon={hasDocument ? File01Icon : CloudUploadIcon}
              size={20}
              color='currentColor'
              strokeWidth={1.5}
              className={hasDocument ? 'text-blue-600' : 'text-gray-400'}
            />
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-900'>{DOC_LABELS[slot]}</p>
            <p className='text-xs text-gray-500 mt-0.5'>{DOC_DESCRIPTIONS[slot]}</p>
          </div>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1', badge.className)}>
          <HugeiconsIcon icon={badge.icon} size={12} color='currentColor' strokeWidth={1.5} />
          {badge.label}
        </span>
      </div>

      {hasDocument ? (
        <div className='flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-gray-900'>{name || DOC_LABELS[slot]}</p>
          </div>
          <div className='flex items-center gap-2 ml-3'>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5'
            >
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} color='currentColor' strokeWidth={1.5} />
              Скачать
            </a>
            <button
              type='button'
              onClick={onUpload}
              className='text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5'
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} color='currentColor' strokeWidth={1.5} />
              Заменить
            </button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={onUpload}
          className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-6 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors'
        >
          <HugeiconsIcon icon={CloudUploadIcon} size={18} color='currentColor' strokeWidth={1.5} />
          Загрузить документ
        </button>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const uploadMutation = useUploadBrokerDocuments();

  const [uploadSlot, setUploadSlot] = React.useState<DocSlot | null>(null);

  const broker = me?.broker;

  const handleUpload = (file: File) => {
    if (!uploadSlot) return;

    const data = uploadSlot === 'inn'
      ? { inn: file, inn_name: file.name }
      : { passport: file, passport_name: file.name };

    toast.promise(
      uploadMutation.mutateAsync(data),
      {
        loading: 'Загрузка документа...',
        success: 'Документ загружен',
        error: 'Ошибка загрузки',
      },
    ).then(() => {
      setUploadSlot(null);
    });
  };

  if (meLoading) {
    return (
      <div className='w-full px-8 py-8'>
        <PageHeader title='Документы' description='Управляйте вашими документами' />
        <div className='flex items-center justify-center py-32'>
          <p className='text-sm text-gray-400'>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full px-8 py-8'>
      <PageHeader
        title='Документы'
        description='Управляйте вашими документами'
      />

      {/* Verification status banner */}
      {broker && broker.verification_status === 'rejected' && (
        <div className='mt-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3'>
          <HugeiconsIcon icon={Cancel02Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-red-600 mt-0.5 shrink-0' />
          <div>
            <p className='text-sm font-medium text-red-800'>Документы отклонены</p>
            <p className='text-xs text-red-600 mt-0.5'>Пожалуйста, загрузите документы повторно.</p>
          </div>
        </div>
      )}

      {broker && broker.verification_status === 'verified' && (
        <div className='mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3'>
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color='currentColor' strokeWidth={1.5} className='text-emerald-600 mt-0.5 shrink-0' />
          <div>
            <p className='text-sm font-medium text-emerald-800'>Документы подтверждены</p>
            <p className='text-xs text-emerald-600 mt-0.5'>
              {broker.verified_at && `Подтверждено: ${new Date(broker.verified_at).toLocaleDateString('ru-RU')}`}
            </p>
          </div>
        </div>
      )}

      <div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <DocumentCard
          slot='inn'
          name={broker?.inn_name}
          url={broker?.inn_url}
          verificationStatus={broker?.verification_status}
          onUpload={() => setUploadSlot('inn')}
        />
        <DocumentCard
          slot='passport'
          name={broker?.passport_name}
          url={broker?.passport_url}
          verificationStatus={broker?.verification_status}
          onUpload={() => setUploadSlot('passport')}
        />
      </div>

      {/* INN number info */}
      {broker?.inn_number && (
        <div className='mt-4 rounded-xl border border-gray-200 bg-white p-5'>
          <p className='text-xs font-medium text-gray-500'>Номер ИНН</p>
          <p className='text-sm font-semibold text-gray-900 mt-1'>{broker.inn_number}</p>
        </div>
      )}

      {uploadSlot && (
        <UploadModal
          open={!!uploadSlot}
          onClose={() => setUploadSlot(null)}
          slot={uploadSlot}
          onUpload={handleUpload}
          isLoading={uploadMutation.isPending}
        />
      )}
    </div>
  );
}
