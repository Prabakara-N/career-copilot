const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "being", "but", "by", "for",
  "from", "had", "has", "have", "he", "her", "his", "i", "if", "in", "into", "is",
  "it", "its", "itself", "just", "me", "my", "nor", "not", "now", "of", "on", "or",
  "our", "ours", "out", "over", "own", "s", "same", "she", "should", "so", "some",
  "such", "t", "than", "that", "the", "their", "them", "then", "there", "these",
  "they", "this", "those", "through", "to", "too", "under", "until", "up", "very",
  "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
  "why", "will", "with", "would", "you", "your", "yours", "yourself", "about",
  "across", "after", "again", "against", "all", "also", "am", "any", "around",
  "because", "before", "below", "between", "both", "can", "could", "do", "does",
  "doing", "done", "don", "each", "few", "here", "how", "including", "other",
  "only", "per", "within", "without",
]);

const PUNCTUATION_RE = /[.,/#!$%^&*;:{}=\-_`~()[\]"'?<>|\\]/g;

export type TokenizeOptions = {
  minLength?: number;
  maxLength?: number;
  dropStopwords?: boolean;
  dropNumbers?: boolean;
};

export function tokenize(text: string, opts: TokenizeOptions = {}): string[] {
  const { minLength = 2, maxLength = 40, dropStopwords = true, dropNumbers = true } = opts;
  const cleaned = text.toLowerCase().replace(PUNCTUATION_RE, " ");
  const raw = cleaned.split(/\s+/);
  const out: string[] = [];
  for (const token of raw) {
    if (!token) continue;
    if (token.length < minLength || token.length > maxLength) continue;
    if (dropStopwords && STOPWORDS.has(token)) continue;
    if (dropNumbers && /^\d+(\.\d+)?$/.test(token)) continue;
    out.push(token);
  }
  return out;
}

export function ngrams(tokens: readonly string[], n: number): string[] {
  if (n < 1 || tokens.length < n) return [];
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    out.push(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

export function extractKeyPhrases(text: string, maxPhrases = 40): string[] {
  const tokens = tokenize(text);
  const unigrams = tokens;
  const bigrams = ngrams(tokens, 2);
  const trigrams = ngrams(tokens, 3);
  const counts = new Map<string, number>();
  for (const group of [unigrams, bigrams, trigrams]) {
    for (const phrase of group) {
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()]
    .filter(([phrase, count]) => count >= 1 && phrase.length >= 3)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxPhrases)
    .map(([phrase]) => phrase);
  return ranked;
}
