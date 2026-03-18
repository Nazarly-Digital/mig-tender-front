import { cnExt } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';

function WidgetBox({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cnExt(
        'w-full rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/40 overflow-hidden',
        className,
      )}
      {...rest}
    />
  );
}

function WidgetBoxHeader({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cnExt(
        'px-5 py-4 border-b border-gray-100 text-[14px] font-semibold text-gray-900 flex items-center gap-2',
        className,
      )}
      {...rest}
    />
  );
}

function WidgetBoxHeaderIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T, React.HTMLAttributes<HTMLDivElement>>) {
  const Component = as || 'div';
  return (
    <Component
      className={cnExt('size-[18px] text-gray-400', className)}
      {...rest}
    />
  );
}

export {
  WidgetBox as Root,
  WidgetBoxHeader as Header,
  WidgetBoxHeaderIcon as HeaderIcon,
};
