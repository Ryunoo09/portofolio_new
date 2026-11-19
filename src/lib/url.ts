/** Only absolute web links may reach an href or a button. */
export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}
