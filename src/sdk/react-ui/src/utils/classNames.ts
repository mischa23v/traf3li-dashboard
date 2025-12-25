/**
 * Utility for combining class names
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];
type ClassDictionary = Record<string, boolean | undefined | null>;

/**
 * Combine class names conditionally
 */
export function cn(...inputs: (ClassValue | ClassDictionary)[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Create a variant class generator
 */
export function createVariants<T extends Record<string, Record<string, string>>>(
  base: string,
  variants: T
) {
  return function getClasses(
    props: { [K in keyof T]?: keyof T[K] } & { className?: string }
  ): string {
    const { className, ...variantProps } = props;
    const classes = [base];

    for (const [variantKey, variantValue] of Object.entries(variantProps)) {
      if (variantValue && variants[variantKey]?.[variantValue as string]) {
        classes.push(variants[variantKey][variantValue as string]);
      }
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  };
}
