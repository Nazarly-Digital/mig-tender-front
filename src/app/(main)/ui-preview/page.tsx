'use client';

import * as React from 'react';
import {
  RiMailLine,
  RiSearch2Line,
  RiUserLine,
  RiEyeLine,
} from '@remixicon/react';

// Old components
import * as OldButton from '@/shared/ui/button';
import * as OldInput from '@/shared/ui/input';
import * as OldLabel from '@/shared/ui/label';
import * as OldHint from '@/shared/ui/hint';
import * as OldAlert from '@/shared/ui/alert';
import * as OldSwitch from '@/shared/ui/switch';

// New components
import { ButtonV2 } from '@/shared/ui/button-v2';
import { InputField } from '@/shared/ui/input-field';
import { InputLabel } from '@/shared/ui/input-label';
import { HintLabel } from '@/shared/ui/hint-label';
import { SwitchV2 } from '@/shared/ui/switch-v2';
import { SelectField } from '@/shared/ui/select-field';
import { DigitInputV2 } from '@/shared/ui/digit-input-v2';
import { Squircle } from '@/shared/ui/squircle';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='space-y-4'>
      <h2 className='text-title-h5 text-text-strong-950 border-b border-stroke-soft-200 pb-2'>
        {title}
      </h2>
      {children}
    </div>
  );
}

function CompareRow({ label, before, after }: { label: string; before: React.ReactNode; after: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[120px,1fr,1fr] gap-4 items-start'>
      <div className='text-label-sm text-text-sub-600 pt-2'>{label}</div>
      <div className='rounded-xl border border-stroke-soft-200 p-4 bg-bg-white-0'>
        <div className='text-subheading-2xs uppercase text-text-soft-400 mb-2'>До</div>
        {before}
      </div>
      <div className='rounded-xl border border-primary-base/30 p-4 bg-bg-white-0'>
        <div className='text-subheading-2xs uppercase text-primary-base mb-2'>После</div>
        {after}
      </div>
    </div>
  );
}

export default function UIPreviewPage() {
  const [switchOld, setSwitchOld] = React.useState(false);
  const [switchNew, setSwitchNew] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div className='flex flex-1 flex-col gap-8 px-4 py-6 lg:px-10 lg:py-8 max-w-[960px]'>
      <div>
        <h1 className='text-title-h4 text-text-strong-950'>UI Preview — До и После</h1>
        <p className='text-paragraph-sm text-text-sub-600 mt-1'>
          Сравнение старых и новых компонентов
        </p>
      </div>

      {/* ===== BUTTONS ===== */}
      <Section title='Button'>
        <CompareRow
          label='Primary'
          before={
            <div className='flex flex-wrap gap-2'>
              <OldButton.Root variant='primary' mode='filled'>Filled</OldButton.Root>
              <OldButton.Root variant='primary' mode='stroke'>Stroke</OldButton.Root>
              <OldButton.Root variant='primary' mode='lighter'>Lighter</OldButton.Root>
              <OldButton.Root variant='primary' mode='ghost'>Ghost</OldButton.Root>
            </div>
          }
          after={
            <div className='flex flex-wrap gap-2'>
              <ButtonV2 variant='default'>Default</ButtonV2>
              <ButtonV2 variant='outline'>Outline</ButtonV2>
              <ButtonV2 variant='secondary'>Secondary</ButtonV2>
              <ButtonV2 variant='ghost'>Ghost</ButtonV2>
            </div>
          }
        />
        <CompareRow
          label='Sizes'
          before={
            <div className='flex flex-wrap items-center gap-2'>
              <OldButton.Root size='medium'>Medium</OldButton.Root>
              <OldButton.Root size='small'>Small</OldButton.Root>
              <OldButton.Root size='xsmall'>XSmall</OldButton.Root>
            </div>
          }
          after={
            <div className='flex flex-wrap items-center gap-2'>
              <ButtonV2 size='lg'>Large</ButtonV2>
              <ButtonV2 size='default'>Default</ButtonV2>
              <ButtonV2 size='sm'>Small</ButtonV2>
              <ButtonV2 size='xs'>XSmall</ButtonV2>
            </div>
          }
        />
        <CompareRow
          label='Destructive'
          before={
            <div className='flex flex-wrap gap-2'>
              <OldButton.Root variant='error' mode='filled'>Error</OldButton.Root>
              <OldButton.Root variant='error' mode='stroke'>Error Stroke</OldButton.Root>
            </div>
          }
          after={
            <div className='flex flex-wrap gap-2'>
              <ButtonV2 variant='destructive'>Destructive</ButtonV2>
              <ButtonV2 variant='link'>Link</ButtonV2>
            </div>
          }
        />
      </Section>

      {/* ===== INPUT ===== */}
      <Section title='Input'>
        <CompareRow
          label='Базовый'
          before={
            <OldInput.Root>
              <OldInput.Wrapper>
                <OldInput.Input placeholder='Введите текст...' />
              </OldInput.Wrapper>
            </OldInput.Root>
          }
          after={
            <InputField placeholder='Введите текст...' size='lg' />
          }
        />
        <CompareRow
          label='С иконкой'
          before={
            <OldInput.Root>
              <OldInput.Wrapper>
                <OldInput.Icon as={RiMailLine} />
                <OldInput.Input placeholder='example@mail.com' />
              </OldInput.Wrapper>
            </OldInput.Root>
          }
          after={
            <InputField
              placeholder='example@mail.com'
              leftIcon={<RiMailLine className='size-5' />}
              size='lg'
            />
          }
        />
        <CompareRow
          label='С ошибкой'
          before={
            <OldInput.Root hasError>
              <OldInput.Wrapper>
                <OldInput.Input placeholder='Некорректное значение' />
              </OldInput.Wrapper>
            </OldInput.Root>
          }
          after={
            <InputField
              placeholder='Некорректное значение'
              state='danger'
              size='lg'
            />
          }
        />
        <CompareRow
          label='Размеры'
          before={
            <div className='space-y-2'>
              <OldInput.Root size='medium'>
                <OldInput.Wrapper><OldInput.Input placeholder='Medium' /></OldInput.Wrapper>
              </OldInput.Root>
              <OldInput.Root size='small'>
                <OldInput.Wrapper><OldInput.Input placeholder='Small' /></OldInput.Wrapper>
              </OldInput.Root>
            </div>
          }
          after={
            <div className='space-y-2'>
              <InputField placeholder='XL' size='xl' />
              <InputField placeholder='LG' size='lg' />
              <InputField placeholder='MD' size='md' />
            </div>
          }
        />
      </Section>

      {/* ===== LABEL ===== */}
      <Section title='Label'>
        <CompareRow
          label='Обычный'
          before={<OldLabel.Root>Имя пользователя</OldLabel.Root>}
          after={<InputLabel label='Имя пользователя' />}
        />
        <CompareRow
          label='Обязательный'
          before={<OldLabel.Root>Email <OldLabel.Asterisk /></OldLabel.Root>}
          after={<InputLabel label='Email' required />}
        />
      </Section>

      {/* ===== HINT ===== */}
      <Section title='Hint'>
        <CompareRow
          label='Обычный'
          before={<OldHint.Root>Подсказка для поля</OldHint.Root>}
          after={<HintLabel hint='Подсказка для поля' />}
        />
        <CompareRow
          label='Ошибка'
          before={<OldHint.Root hasError>Поле обязательно</OldHint.Root>}
          after={<HintLabel hint='Поле обязательно' variant='danger' />}
        />
      </Section>

      {/* ===== SWITCH ===== */}
      <Section title='Switch'>
        <CompareRow
          label='Toggle'
          before={
            <div className='flex items-center gap-3'>
              <OldSwitch.Root checked={switchOld} onCheckedChange={setSwitchOld} />
              <span className='text-paragraph-sm text-text-sub-600'>{switchOld ? 'Вкл' : 'Выкл'}</span>
            </div>
          }
          after={
            <div className='flex items-center gap-3'>
              <SwitchV2 checked={switchNew} onChange={setSwitchNew} />
              <span className='text-paragraph-sm text-text-sub-600'>{switchNew ? 'Вкл' : 'Выкл'}</span>
            </div>
          }
        />
      </Section>

      {/* ===== SELECT FIELD ===== */}
      <Section title='Select Field (новый)'>
        <div className='grid grid-cols-[120px,1fr] gap-4'>
          <div className='text-label-sm text-text-sub-600 pt-2'>Варианты</div>
          <div className='space-y-3 max-w-sm'>
            <SelectField label='Тип объекта' primaryText='Квартира' />
            <SelectField label='С ошибкой' primaryText='Выберите...' state='danger' hint='Обязательное поле' />
            <SelectField primaryText='Без лейбла' />
            <SelectField label='Disabled' primaryText='Недоступно' disabled />
          </div>
        </div>
      </Section>

      {/* ===== DIGIT INPUT ===== */}
      <Section title='Digit Input'>
        <CompareRow
          label='OTP код'
          before={
            <div className='flex gap-2'>
              <div className='h-16 w-14 rounded-[10px] bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 flex items-center justify-center text-title-h5 text-text-strong-950'>1</div>
              <div className='h-16 w-14 rounded-[10px] bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 flex items-center justify-center text-title-h5 text-text-strong-950'>2</div>
              <div className='h-16 w-14 rounded-[10px] bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 flex items-center justify-center text-title-h5 text-text-strong-950'>3</div>
              <div className='h-16 w-14 rounded-[10px] bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 flex items-center justify-center text-title-h5 text-text-soft-400'>_</div>
            </div>
          }
          after={
            <div className='flex gap-2'>
              <DigitInputV2 defaultValue='1' state='filled' />
              <DigitInputV2 defaultValue='2' state='filled' />
              <DigitInputV2 defaultValue='3' state='filled' />
              <DigitInputV2 placeholder='·' />
            </div>
          }
        />
      </Section>

      {/* ===== SQUIRCLE ===== */}
      <Section title='Squircle (новый)'>
        <div className='grid grid-cols-[120px,1fr] gap-4'>
          <div className='text-label-sm text-text-sub-600 pt-2'>Сравнение</div>
          <div className='flex gap-6 items-center'>
            <div className='text-center space-y-2'>
              <div className='w-20 h-20 rounded-2xl bg-primary-base flex items-center justify-center text-white text-xs'>
                border-radius
              </div>
              <span className='text-paragraph-xs text-text-soft-400'>CSS rounded</span>
            </div>
            <div className='text-center space-y-2'>
              <Squircle cornerRadius={20} className='w-20 h-20 bg-primary-base flex items-center justify-center text-white text-xs'>
                squircle
              </Squircle>
              <span className='text-paragraph-xs text-text-soft-400'>Squircle (iOS)</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== FORM EXAMPLE ===== */}
      <Section title='Полная форма — До и После'>
        <div className='grid grid-cols-2 gap-6'>
          {/* OLD */}
          <div className='rounded-xl border border-stroke-soft-200 p-5 bg-bg-white-0 space-y-4'>
            <div className='text-subheading-2xs uppercase text-text-soft-400 mb-3'>Старые компоненты</div>
            <div className='space-y-1.5'>
              <OldLabel.Root>Email <OldLabel.Asterisk /></OldLabel.Root>
              <OldInput.Root>
                <OldInput.Wrapper>
                  <OldInput.Icon as={RiMailLine} />
                  <OldInput.Input placeholder='example@mail.com' />
                </OldInput.Wrapper>
              </OldInput.Root>
              <OldHint.Root>Ваш рабочий email</OldHint.Root>
            </div>
            <div className='space-y-1.5'>
              <OldLabel.Root>Поиск</OldLabel.Root>
              <OldInput.Root size='small'>
                <OldInput.Wrapper>
                  <OldInput.Icon as={RiSearch2Line} />
                  <OldInput.Input placeholder='Найти...' />
                </OldInput.Wrapper>
              </OldInput.Root>
            </div>
            <OldButton.Root variant='primary' mode='filled' className='w-full'>
              Отправить
            </OldButton.Root>
          </div>

          {/* NEW */}
          <div className='rounded-xl border border-primary-base/30 p-5 bg-bg-white-0 space-y-4'>
            <div className='text-subheading-2xs uppercase text-primary-base mb-3'>Новые компоненты</div>
            <InputField
              label='Email'
              placeholder='example@mail.com'
              leftIcon={<RiMailLine className='size-5' />}
              hint='Ваш рабочий email'
              size='lg'
            />
            <InputField
              label='Поиск'
              placeholder='Найти...'
              leftIcon={<RiSearch2Line className='size-5' />}
              size='md'
            />
            <ButtonV2 variant='default' className='w-full'>
              Отправить
            </ButtonV2>
          </div>
        </div>
      </Section>
    </div>
  );
}
