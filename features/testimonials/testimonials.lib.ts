/** Splits a quote into dialogue-box pages at sentence ends, each at most `max` chars unless one sentence is longer. */
export function paginate(text: string, max = 200): string[] {
  const pages: string[] = [];
  for (const sentence of text.trim().split(/(?<=[.!?])\s+/)) {
    const last = pages.at(-1);
    if (last !== undefined && last.length + 1 + sentence.length <= max) pages[pages.length - 1] = `${last} ${sentence}`;
    else pages.push(sentence);
  }
  return pages;
}
