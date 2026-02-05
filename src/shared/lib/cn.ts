import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { type ClassValue } from 'clsx';

/**
 * Utilizes `clsx` with `tailwind-merge`, use in cases of possible class conflicts.
 */
export function cnExt(...classes: ClassValue[]) {
  return twMerge(clsx(...classes));
}

/**
 * A direct export of `clsx` without `tailwind-merge`.
 */
export const cn = clsx;
