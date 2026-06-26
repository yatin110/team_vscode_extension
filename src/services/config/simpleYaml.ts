interface Line {
  indent: number;
  text: string;
}

export function parseSimpleYaml(input: string): unknown {
  const lines = input
    .split(/\r?\n/)
    .map(stripComment)
    .filter((line) => line.trim().length > 0)
    .map((line) => ({
      indent: line.length - line.trimStart().length,
      text: line.trim(),
    }));

  const [value] = parseBlock(lines, 0, 0);
  return value;
}

function parseBlock(
  lines: Line[],
  start: number,
  indent: number,
): [unknown, number] {
  const first = lines[start];
  if (!first || first.indent < indent) {
    return [{}, start];
  }

  if (first.indent === indent && first.text.startsWith("- ")) {
    return parseArray(lines, start, indent);
  }

  return parseObject(lines, start, indent);
}

function parseObject(
  lines: Line[],
  start: number,
  indent: number,
): [Record<string, unknown>, number] {
  const result: Record<string, unknown> = {};
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) {
      break;
    }
    if (line.indent > indent) {
      index += 1;
      continue;
    }
    if (line.text.startsWith("- ")) {
      break;
    }

    const { key, value } = splitKeyValue(line.text);
    if (value === undefined) {
      const [nested, next] = parseBlock(lines, index + 1, indent + 2);
      result[key] = nested;
      index = next;
    } else {
      result[key] = parseScalar(value);
      index += 1;
    }
  }

  return [result, index];
}

function parseArray(
  lines: Line[],
  start: number,
  indent: number,
): [unknown[], number] {
  const result: unknown[] = [];
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) {
      break;
    }
    if (line.indent > indent) {
      index += 1;
      continue;
    }
    if (!line.text.startsWith("- ")) {
      break;
    }

    const itemText = line.text.slice(2).trim();
    if (!itemText) {
      const [nested, next] = parseBlock(lines, index + 1, indent + 2);
      result.push(nested);
      index = next;
      continue;
    }

    if (looksLikeKeyValue(itemText)) {
      const { key, value } = splitKeyValue(itemText);
      const item: Record<string, unknown> = {
        [key]: value === undefined ? {} : parseScalar(value),
      };
      const [nested, next] = parseObject(lines, index + 1, indent + 2);
      result.push({ ...item, ...nested });
      index = next;
      continue;
    }

    result.push(parseScalar(itemText));
    index += 1;
  }

  return [result, index];
}

function splitKeyValue(text: string): { key: string; value: string | undefined } {
  const separator = text.indexOf(":");
  if (separator < 0) {
    throw new Error(`Invalid YAML line: ${text}`);
  }

  const key = text.slice(0, separator).trim();
  const value = text.slice(separator + 1).trim();
  return { key, value: value.length > 0 ? value : undefined };
}

function looksLikeKeyValue(text: string): boolean {
  return /^[A-Za-z0-9_-]+:/.test(text);
}

function parseScalar(value: string): string | number | boolean | null {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === "null") {
    return null;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value.replace(/^["']|["']$/g, "");
}

function stripComment(line: string): string {
  const hash = line.indexOf("#");
  if (hash < 0) {
    return line;
  }

  const before = line.slice(0, hash);
  const quoteCount = (before.match(/["']/g) ?? []).length;
  return quoteCount % 2 === 0 ? before : line;
}
