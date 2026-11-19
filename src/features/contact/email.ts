/** Same shape the browser accepts for a `mailto:`; enough to reject typos and blanks. */
export function isEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Character codes instead of the address (US-06): a mail server cannot scrape
 * it from the HTML source, and the React flight payload only carries numbers.
 * The browser rebuilds the address when it builds the `mailto:` link.
 */
export function toCharCodes(value: string): number[] {
  return Array.from(value, (character) => character.charCodeAt(0));
}
