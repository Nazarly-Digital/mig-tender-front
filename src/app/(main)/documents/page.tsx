'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CloudUploadIcon,
  File01Icon,
  Cancel01Icon,
  Pdf01Icon,
  Doc01Icon,
  Xls01Icon,
  Image01Icon,
  Delete01Icon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/shared/lib/cn';
import * as Modal from '@/shared/ui/modal';
import { PageHeader } from '@/shared/components/page-header';

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
};

const STORAGE_KEY = 'documents_cache';

function loadFromStorage(): UploadedFile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<UploadedFile, 'uploadedAt'> & { uploadedAt: string }>;
    return parsed.map((d) => ({ ...d, uploadedAt: new Date(d.uploadedAt) }));
  } catch {
    return [];
  }
}

function saveToStorage(docs: UploadedFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {}
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function getFileIcon(type: string) {
  if (type.includes('pdf')) return Pdf01Icon;
  if (type.includes('word') || type.includes('document')) return Doc01Icon;
  if (type.includes('sheet') || type.includes('excel')) return Xls01Icon;
  if (type.startsWith('image/')) return Image01Icon;
  return File01Icon;
}

function getFileIconColor(type: string): { bg: string; text: string } {
  if (type.includes('pdf')) return { bg: 'bg-red-50', text: 'text-red-600' };
  if (type.includes('word') || type.includes('document')) return { bg: 'bg-blue-50', text: 'text-blue-600' };
  if (type.includes('sheet') || type.includes('excel')) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
  if (type.startsWith('image/')) return { bg: 'bg-purple-50', text: 'text-purple-600' };
  return { bg: 'bg-gray-100', text: 'text-gray-500' };
}

function getFileTypeBadge(type: string): string {
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('word') || type.includes('document')) return 'DOC';
  if (type.includes('sheet') || type.includes('excel')) return 'XLS';
  if (type.startsWith('image/')) return 'IMG';
  return 'FILE';
}

function UploadModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}) {
  const [dragging, setDragging] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
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
    const files = Array.from(e.dataTransfer.files);
    if (files.length) setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!selectedFiles.length) return;
    onUpload(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Modal.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Modal.Content className='max-w-[480px]'>
        <Modal.Header className='pr-5'>
          <div className='flex flex-1 items-start justify-between gap-3'>
            <div>
              <Modal.Title>Загрузить документы</Modal.Title>
              <Modal.Description>PDF, Word, Excel, изображения</Modal.Description>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='space-y-4'>
          {/* Drop zone */}
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
                Перетащите файлы сюда
              </p>
              <p className='text-[12px] text-gray-400'>
                или нажмите, чтобы выбрать файлы
              </p>
            </div>
            <p className='text-[12px] text-gray-400'>
              PDF, DOCX, XLSX, PNG, JPG — до 50 МБ
            </p>
            <input
              ref={inputRef}
              type='file'
              multiple
              accept='.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp'
              className='hidden'
              onChange={handleFileChange}
            />
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className='space-y-2'>
              <p className='text-[12px] font-medium text-gray-500'>
                Выбрано файлов: {selectedFiles.length}
              </p>
              <div className='max-h-[200px] space-y-2 overflow-y-auto'>
                {selectedFiles.map((file, i) => {
                  const icon = getFileIcon(file.type);
                  const colors = getFileIconColor(file.type);
                  return (
                    <div
                      key={i}
                      className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5'
                    >
                      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', colors.bg)}>
                        <HugeiconsIcon icon={icon} size={16} color='currentColor' strokeWidth={1.5} className={colors.text} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-[13px] font-medium text-gray-900'>
                          {file.name}
                        </p>
                        <p className='text-[12px] text-gray-400'>
                          {formatBytes(file.size)}
                        </p>
                      </div>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className='text-gray-400 hover:text-gray-600 transition-colors'
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            type='button'
            onClick={handleClose}
            className='bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors'
          >
            Отмена
          </button>
          <button
            type='button'
            disabled={selectedFiles.length === 0}
            onClick={handleUpload}
            className='bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
          >
            Загрузить{selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default function DocumentsPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [documents, setDocuments] = React.useState<UploadedFile[]>(() => loadFromStorage());

  const updateDocuments = (updater: (prev: UploadedFile[]) => UploadedFile[]) => {
    setDocuments((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  };

  const handleUpload = (files: File[]) => {
    const newDocs: UploadedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    }));
    updateDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleDelete = (id: string) => {
    updateDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className='w-full px-8 py-8'>
      <PageHeader
        title='Документы'
        description='Управляйте вашими документами'
        action={
          documents.length > 0 ? (
            <button
              type='button'
              onClick={() => setModalOpen(true)}
              className='bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors'
            >
              Загрузить документы
            </button>
          ) : undefined
        }
      />

      {documents.length === 0 ? (
        /* Empty state */
        <div className='flex flex-1 items-center justify-center py-32'>
          <div className='flex flex-col items-center text-center'>
            <HugeiconsIcon icon={File01Icon} size={24} color='currentColor' strokeWidth={1.5} className='text-gray-300' />
            <p className='text-[14px] font-medium text-gray-900 mt-3'>Нет загруженных документов</p>
            <p className='text-[13px] text-gray-400 mt-1 max-w-sm text-center'>
              Загрузите документы, чтобы они появились здесь
            </p>
            <button
              type='button'
              onClick={() => setModalOpen(true)}
              className='bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg px-4 py-2 text-[13px] font-medium transition-colors mt-5'
            >
              Загрузить документы
            </button>
          </div>
        </div>
      ) : (
        /* Documents list */
        <div className='rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden mt-6'>
          <div className='px-5 py-4 border-b border-blue-50 flex items-center justify-between'>
            <span className='text-[14px] font-semibold text-gray-900'>Все документы</span>
            <span className='text-[13px] text-gray-400'>{documents.length}</span>
          </div>
          <div>
            {documents.map((doc) => {
              const icon = getFileIcon(doc.type);
              const colors = getFileIconColor(doc.type);
              const badge = getFileTypeBadge(doc.type);

              return (
                <div
                  key={doc.id}
                  className='flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors group'
                >
                  <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', colors.bg)}>
                    <HugeiconsIcon icon={icon} size={16} color='currentColor' strokeWidth={1.5} className={colors.text} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-[13px] font-medium text-gray-900'>{doc.name}</p>
                    <p className='text-[12px] text-gray-400'>
                      {formatBytes(doc.size)} · {doc.uploadedAt.toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <span className='rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500'>
                    {badge}
                  </span>
                  <button
                    type='button'
                    onClick={() => handleDelete(doc.id)}
                    className='opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500'
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={16} color='currentColor' strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
