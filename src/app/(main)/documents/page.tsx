'use client';

import * as React from 'react';
import {
  RiUploadCloud2Line,
  RiFileTextLine,
  RiCloseLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiFileExcelLine,
  RiFileImageLine,
  RiDeleteBinLine,
} from '@remixicon/react';

import { cn } from '@/shared/lib/cn';
import * as FancyButton from '@/shared/ui/fancy-button';
import * as Button from '@/shared/ui/button';
import * as Modal from '@/shared/ui/modal';
import * as CompactButton from '@/shared/ui/compact-button';
import { PageHeader } from '@/shared/components/page-header';
import * as WidgetBox from '@/shared/components/widget-box';

type UploadedFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function getFileIcon(type: string) {
  if (type.includes('pdf')) return RiFilePdfLine;
  if (type.includes('word') || type.includes('document')) return RiFileWordLine;
  if (type.includes('sheet') || type.includes('excel')) return RiFileExcelLine;
  if (type.startsWith('image/')) return RiFileImageLine;
  return RiFileTextLine;
}

function getFileIconColor(_type: string): string {
  return 'text-primary-base';
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
            <div className='flex items-center gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200'>
                <RiUploadCloud2Line className='size-5 text-text-sub-600' />
              </div>
              <div>
                <Modal.Title>Загрузить документы</Modal.Title>
                <Modal.Description>PDF, Word, Excel, изображения</Modal.Description>
              </div>
            </div>
            <Modal.Close asChild>
              <CompactButton.Root variant='ghost' size='medium' onClick={handleClose}>
                <CompactButton.Icon as={RiCloseLine} />
              </CompactButton.Root>
            </Modal.Close>
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
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200',
              dragging
                ? 'border-primary-base bg-primary-alpha-10'
                : 'border-stroke-soft-200 bg-bg-weak-50 hover:border-primary-base hover:bg-primary-alpha-10',
            )}
          >
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-full transition-colors',
                dragging ? 'bg-primary-alpha-10' : 'bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200',
              )}
            >
              <RiUploadCloud2Line
                className={cn('size-6', dragging ? 'text-primary-base' : 'text-text-sub-600')}
              />
            </div>
            <div className='space-y-1'>
              <p className='text-label-sm text-text-strong-950'>
                Перетащите файлы сюда
              </p>
              <p className='text-paragraph-xs text-text-soft-400'>
                или нажмите, чтобы выбрать файлы
              </p>
            </div>
            <p className='text-paragraph-xs text-text-soft-400'>
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
              <p className='text-label-xs text-text-sub-600'>
                Выбрано файлов: {selectedFiles.length}
              </p>
              <div className='max-h-[200px] space-y-2 overflow-y-auto'>
                {selectedFiles.map((file, i) => {
                  const Icon = getFileIcon(file.type);
                  const iconColor = getFileIconColor(file.type);
                  return (
                    <div
                      key={i}
                      className='flex animate-in fade-in slide-in-from-bottom-1 items-center gap-3 rounded-xl bg-primary-alpha-10 px-3 py-2.5 ring-1 ring-inset ring-primary-alpha-16'
                      style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both', animationDuration: '150ms' }}
                    >
                      <Icon className={cn('size-5 shrink-0', iconColor)} />
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-label-sm text-text-strong-950'>
                          {file.name}
                        </p>
                        <p className='text-paragraph-xs text-text-soft-400'>
                          {formatBytes(file.size)}
                        </p>
                      </div>
                      <CompactButton.Root
                        variant='ghost'
                        size='medium'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                      >
                        <CompactButton.Icon as={RiCloseLine} />
                      </CompactButton.Root>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button.Root variant='neutral' mode='stroke' onClick={handleClose}>
            Отмена
          </Button.Root>
          <FancyButton.Root
            variant='primary'
            disabled={selectedFiles.length === 0}
            onClick={handleUpload}
          >
            <FancyButton.Icon as={RiUploadCloud2Line} />
            Загрузить{selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}
          </FancyButton.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function DocumentCard({
  doc,
  onDelete,
  index,
}: {
  doc: UploadedFile;
  onDelete: (id: string) => void;
  index: number;
}) {
  const Icon = getFileIcon(doc.type);
  const iconColor = getFileIconColor(doc.type);
  const badge = getFileTypeBadge(doc.type);

  return (
    <div
      className='group flex animate-in fade-in slide-in-from-bottom-2 items-center gap-3 rounded-xl bg-bg-white-0 px-4 py-3 ring-1 ring-inset ring-stroke-soft-200 transition-shadow duration-200 hover:shadow-regular-xs'
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both', animationDuration: '200ms' }}
    >
      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-alpha-10'>
        <Icon className={cn('size-5', iconColor)} />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-label-sm text-text-strong-950'>{doc.name}</p>
        <p className='text-paragraph-xs text-text-soft-400'>
          {formatBytes(doc.size)} · {doc.uploadedAt.toLocaleDateString('ru-RU')}
        </p>
      </div>
      <span className='shrink-0 rounded-md bg-primary-alpha-10 px-1.5 py-0.5 text-subheading-xs font-medium text-primary-base'>
        {badge}
      </span>
      <CompactButton.Root
        variant='ghost'
        size='medium'
        className='opacity-0 transition-opacity group-hover:opacity-100'
        onClick={() => onDelete(doc.id)}
      >
        <CompactButton.Icon as={RiDeleteBinLine} />
      </CompactButton.Root>
    </div>
  );
}

export default function DocumentsPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [documents, setDocuments] = React.useState<UploadedFile[]>([]);

  const handleUpload = (files: File[]) => {
    const newDocs: UploadedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className='flex flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8'>
      <PageHeader
        title='Документы'
        description='Управляйте вашими документами'
        action={
          documents.length > 0 ? (
            <FancyButton.Root variant='primary' onClick={() => setModalOpen(true)}>
              <FancyButton.Icon as={RiUploadCloud2Line} />
              Загрузить документы
            </FancyButton.Root>
          ) : undefined
        }
      />

      {documents.length === 0 ? (
        /* Empty state */
        <div className='flex flex-1 items-center justify-center'>
          <div className='flex flex-col items-center gap-6 text-center'>
            <div className='flex size-20 items-center justify-center rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shadow-regular-xs'>
              <RiFileTextLine className='size-9 text-text-soft-400' />
            </div>
            <div className='space-y-2'>
              <p className='text-label-lg text-text-strong-950'>
                Никаких документов?
              </p>
              <p className='text-paragraph-sm text-text-sub-600'>
                Загрузите, пожалуйста.
              </p>
            </div>
            <FancyButton.Root variant='primary' onClick={() => setModalOpen(true)}>
              <FancyButton.Icon as={RiUploadCloud2Line} />
              Загрузить документы
            </FancyButton.Root>
          </div>
        </div>
      ) : (
        /* Documents list */
        <WidgetBox.Root className='space-y-4'>
          <WidgetBox.Header>
            Все документы
            <span className='ml-auto text-label-sm font-normal text-text-soft-400'>
              {documents.length}
            </span>
          </WidgetBox.Header>
          <div className='space-y-2'>
            {documents.map((doc, i) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} index={i} />
            ))}
          </div>
        </WidgetBox.Root>
      )}

      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
