import { en } from "./locales/en";
import { it } from "./locales/it";
import { sq } from "./locales/sq";

export const messages = {
  it,
  en,
  sq,
} as const;

export type Locale = keyof typeof messages;

export type TranslationKey = NestedKeyOf<typeof it>;

export type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & string];
