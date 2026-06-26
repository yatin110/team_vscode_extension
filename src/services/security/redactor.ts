const SECRET_PATTERNS = [
  /PRIVATE-TOKEN:\s*[^\s]+/gi,
  /Authorization:\s*Bearer\s+[^\s]+/gi,
  /password\s*=\s*["']?[^"'\s]+/gi,
  /token\s*=\s*["']?[^"'\s]+/gi,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+ PRIVATE KEY-----/g,
];

export function redactSensitiveText(input: string): string {
  return SECRET_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, "[REDACTED]"),
    input,
  );
}
