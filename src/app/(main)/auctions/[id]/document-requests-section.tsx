'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, FileUploadIcon, CheckListIcon } from '@hugeicons/core-free-icons';

import * as FancyButton from '@/shared/ui/fancy-button';
import * as Modal from '@/shared/ui/modal';
import {
  useCreateDocumentRequest,
  useUploadDocumentResponse,
} from '@/features/document-requests';
import type {
  DocumentRequest,
  DocumentRequestStatus,
} from '@/shared/types/document-requests';

const MAX_DESCRIPTION_LEN = 4000;
const MAX_FILES = 20;

const STATUS_CFG: Record<DocumentRequestStatus, { label: string; cls: string }> = {
  pending: { label: 'Ожидает ответа', cls: 'bg-amber-50 text-amber-700' },
  answered: { label: 'Отвечен', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Отменён', cls: 'bg-gray-100 text-gray-600' },
};

function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { error?: string; detail?: string } } };
  return err.response?.data?.error ?? err.response?.data?.detail ?? 'Произошла ошибка';
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || 'файл');
  } catch {
    const parts = url.split('/').filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || 'файл');
  }
}

// --- Create request modal (owner / admin) ---

export function RequestDocumentsModal({
  auctionId,
  brokerId,
  brokerName,
  open,
  onOpenChange,
}: {
  auctionId: number;
  brokerId: number;
  brokerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [description, setDescription] = React.useState('');
  const createRequest = useCreateDocumentRequest();

  React.useEffect(() => {
    if (!open) setDescription('');
  }, [open]);

  const trimmed = description.trim();
  const isDisabled = !trimmed || trimmed.length > MAX_DESCRIPTION_LEN || createRequest.isPending;

  const handleSubmit = () => {
    if (isDisabled) return;
    createRequest.mutate(
      { auctionId, data: { broker_id: brokerId, description: trimmed } },
      {
        onSuccess: () => {
          toast.success('Запрос отправлен брокеру');
          onOpenChange(false);
        },
        onError: (error) => toast.error(getApiError(error)),
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[520px]'>
        <Modal.Header
          title='Запросить документы'
          description={`Опишите, какие документы нужно загрузить брокеру: ${brokerName}`}
        />
        <Modal.Body className='space-y-2'>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Например: скан паспорта, ИНН, справка о доходах'
            rows={5}
            maxLength={MAX_DESCRIPTION_LEN}
            className='w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors resize-none'
          />
          <div className='flex justify-between text-[11px] text-gray-400'>
            <span>Обязательное поле</span>
            <span>{description.length} / {MAX_DESCRIPTION_LEN}</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>Отмена</FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant='primary'
            size='small'
            disabled={isDisabled}
            onClick={handleSubmit}
          >
            {createRequest.isPending ? 'Отправка...' : 'Отправить запрос'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Upload response modal (broker) ---

export function UploadResponseModal({
  request,
  open,
  onOpenChange,
}: {
  request: DocumentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [comment, setComment] = React.useState('');
  const [dragOver, setDragOver] = React.useState(false);
  const uploadResponse = useUploadDocumentResponse();

  React.useEffect(() => {
    if (!open) {
      setFiles([]);
      setComment('');
      setDragOver(false);
    }
  }, [open]);

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= MAX_FILES) break;
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setFiles(next);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isDisabled = files.length === 0 || files.length > MAX_FILES || uploadResponse.isPending;

  const handleSubmit = () => {
    if (isDisabled) return;
    uploadResponse.mutate(
      { requestId: request.id, data: { files, broker_comment: comment.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success('Документы отправлены');
          onOpenChange(false);
        },
        onError: (error) => toast.error(getApiError(error)),
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[560px]'>
        <Modal.Header
          title='Загрузить документы'
          description={`До ${MAX_FILES} файлов. Запрос: ${request.description}`}
        />
        <Modal.Body className='space-y-3'>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={`block cursor-pointer rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50/60' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <HugeiconsIcon icon={FileUploadIcon} size={24} color='currentColor' strokeWidth={1.5} className='mx-auto text-gray-400' />
            <p className='mt-2 text-sm font-medium text-gray-700'>Перетащите файлы или нажмите для выбора</p>
            <p className='mt-0.5 text-[11px] text-gray-400'>Выбрано {files.length} из {MAX_FILES}</p>
            <input
              type='file'
              multiple
              className='hidden'
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          {files.length > 0 && (
            <ul className='space-y-1.5 max-h-48 overflow-y-auto'>
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className='flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px]'>
                  <span className='flex items-center gap-2 text-gray-900 truncate'>
                    <HugeiconsIcon icon={File01Icon} size={14} color='currentColor' strokeWidth={1.5} className='text-gray-400 shrink-0' />
                    <span className='truncate'>{f.name}</span>
                  </span>
                  <button
                    type='button'
                    onClick={() => removeFile(i)}
                    className='text-[11px] font-medium text-red-600 hover:text-red-700'
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Комментарий (опционально)'
            rows={2}
            className='w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 transition-colors resize-none'
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <FancyButton.Root variant='basic' size='small'>Отмена</FancyButton.Root>
          </Modal.Close>
          <FancyButton.Root
            variant='primary'
            size='small'
            disabled={isDisabled}
            onClick={handleSubmit}
          >
            {uploadResponse.isPending ? 'Загрузка...' : 'Отправить ответ'}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

// --- Request card (shared, compact) ---

function DocumentRequestCard({
  request,
  showBroker,
}: {
  request: DocumentRequest;
  showBroker: boolean;
}) {
  const cfg = STATUS_CFG[request.status];
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-3 space-y-2'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          {showBroker && (
            <p className='text-[11px] text-gray-400'>
              Брокер: <span className='font-medium text-gray-600'>{request.broker_email || `#${request.broker}`}</span>
            </p>
          )}
          <p className='text-[13px] text-gray-900 break-words'>{request.description}</p>
          <p className='mt-0.5 text-[11px] text-gray-400'>{formatDateTime(request.created_at)}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.cls}`}>{cfg.label}</span>
      </div>

      {request.status === 'answered' && (
        <div className='space-y-1.5 border-t border-gray-100 pt-2'>
          {request.broker_comment && (
            <p className='text-[12px] text-gray-700'>
              <span className='text-[11px] font-medium uppercase tracking-wide text-gray-400'>Комментарий:</span>{' '}
              {request.broker_comment}
            </p>
          )}
          <ul className='space-y-1'>
            {request.response_documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.file}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline'
                >
                  <HugeiconsIcon icon={File01Icon} size={13} color='currentColor' strokeWidth={1.5} />
                  {fileNameFromUrl(doc.file)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {request.status === 'pending' && (
        <p className='text-[11px] text-gray-400'>Ожидает ответа брокера</p>
      )}
    </div>
  );
}

// --- Owner/Admin section: full list of requests ---

export function DocumentRequestsList({
  requests,
}: {
  requests: DocumentRequest[];
}) {
  if (requests.length === 0) return null;

  return (
    <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-6'>
      <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3'>
        <HugeiconsIcon icon={CheckListIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
        Запросы документов ({requests.length})
      </h3>
      <div className='space-y-2'>
        {requests.map((req) => (
          <DocumentRequestCard key={req.id} request={req} showBroker />
        ))}
      </div>
    </div>
  );
}

// --- Broker view: incoming request block (prominent) ---

export function BrokerIncomingRequests({
  requests,
}: {
  requests: DocumentRequest[];
}) {
  const [uploadFor, setUploadFor] = React.useState<DocumentRequest | null>(null);

  if (requests.length === 0) return null;

  const pending = requests.filter((r) => r.status === 'pending');
  const answered = requests.filter((r) => r.status === 'answered');

  return (
    <>
      {pending.length > 0 && (
        <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 space-y-3'>
          <div>
            <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
              <HugeiconsIcon icon={FileUploadIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
              Запрос документов ({pending.length})
            </h3>
            <p className='mt-0.5 text-[12px] text-gray-500'>
              Девелопер запросил у вас дополнительные документы. Загрузите ответ для каждого запроса.
            </p>
          </div>
          <div className='space-y-2'>
            {pending.map((req) => (
              <div key={req.id} className='rounded-lg border border-gray-200 bg-white p-3'>
                <p className='text-[13px] text-gray-900 break-words'>{req.description}</p>
                <p className='mt-0.5 text-[11px] text-gray-400'>{formatDateTime(req.created_at)}</p>
                <div className='mt-2.5'>
                  <FancyButton.Root
                    variant='primary'
                    size='xsmall'
                    onClick={() => setUploadFor(req)}
                  >
                    <HugeiconsIcon icon={FileUploadIcon} size={14} color='currentColor' strokeWidth={1.5} />
                    Загрузить ответ
                  </FancyButton.Root>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {answered.length > 0 && (
        <div className='rounded-xl border border-gray-200 bg-white p-5 space-y-2'>
          <h3 className='text-[14px] font-semibold text-gray-900 flex items-center gap-2'>
            <HugeiconsIcon icon={CheckListIcon} size={18} color='currentColor' strokeWidth={1.5} className='text-gray-400' />
            Отправленные документы ({answered.length})
          </h3>
          <div className='space-y-2'>
            {answered.map((req) => (
              <DocumentRequestCard key={req.id} request={req} showBroker={false} />
            ))}
          </div>
        </div>
      )}

      {uploadFor && (
        <UploadResponseModal
          request={uploadFor}
          open={!!uploadFor}
          onOpenChange={(open) => {
            if (!open) setUploadFor(null);
          }}
        />
      )}
    </>
  );
}

// --- Per-broker request button (owner/admin, in participants/bids list) ---

export function RequestDocumentsButton({
  auctionId,
  brokerId,
  brokerName,
  lockStatus,
}: {
  auctionId: number;
  brokerId: number;
  brokerName: string;
  lockStatus: 'pending' | 'answered' | null;
}) {
  const [open, setOpen] = React.useState(false);

  const isLocked = lockStatus !== null;
  const label = lockStatus === 'answered' ? 'Документы получены' : 'Запросить документы';
  const tooltip =
    lockStatus === 'pending'
      ? 'Ожидается ответ брокера на предыдущий запрос'
      : lockStatus === 'answered'
        ? 'Документы от брокера уже получены'
        : 'Запросить документы';

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        disabled={isLocked}
        title={tooltip}
        className='inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <HugeiconsIcon icon={FileUploadIcon} size={12} color='currentColor' strokeWidth={1.5} />
        {label}
      </button>
      {!isLocked && (
        <RequestDocumentsModal
          auctionId={auctionId}
          brokerId={brokerId}
          brokerName={brokerName}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}

// --- Warning banner before confirm/reject result ---

export function PendingRequestsWarning({
  pendingCount,
}: {
  pendingCount: number;
}) {
  if (pendingCount === 0) return null;
  return (
    <div className='rounded-lg border border-amber-300 bg-amber-50/80 p-3'>
      <p className='text-[13px] font-medium text-amber-800'>
        Есть незакрытые запросы документов ({pendingCount})
      </p>
      <p className='mt-0.5 text-[12px] text-amber-700'>
        Дождитесь ответа брокера или всё равно примите решение.
      </p>
    </div>
  );
}

// Returns the status that locks further requests for this broker, or null.
// Both 'pending' (waiting for broker) and 'answered' (docs received) lock the button —
// developer shouldn't be able to spam new requests or re-request after receiving docs.
export function getRequestLockStatusForBroker(
  requests: DocumentRequest[] | undefined,
  brokerId: number,
): 'pending' | 'answered' | null {
  if (!requests) return null;
  const brokerRequests = requests.filter((r) => r.broker === brokerId);
  if (brokerRequests.some((r) => r.status === 'pending')) return 'pending';
  if (brokerRequests.some((r) => r.status === 'answered')) return 'answered';
  return null;
}
