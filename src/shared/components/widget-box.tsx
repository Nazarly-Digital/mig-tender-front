import { cnExt } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';

function WidgetBox({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cnExt(
        'w-full min-w-0 rounded-xl border border-gray-200 bg-white p-6',
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
        'grid auto-cols-auto grid-flow-col grid-cols-1 items-center gap-2 has-[>svg:first-child]:grid-cols-[auto,minmax(0,1fr)]',
        'mb-5 border-b border-gray-200 pb-4 text-sm font-semibold text-gray-900',
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
