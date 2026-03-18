import { cnExt } from '@/shared/lib/cn';
import type { PolymorphicComponentProps } from '@/shared/lib/polymorphic';

function WidgetBox({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cnExt(
        'w-full min-w-0 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5',
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
        'mb-4 pb-4 border-b border-stroke-soft-200 text-[13px] font-semibold text-text-strong-950 md:text-label-sm',
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
      className={cnExt('size-5 text-text-soft-400', className)}
      {...rest}
    />
  );
}

export {
  WidgetBox as Root,
  WidgetBoxHeader as Header,
  WidgetBoxHeaderIcon as HeaderIcon,
};
