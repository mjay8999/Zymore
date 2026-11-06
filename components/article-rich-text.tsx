import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[^*\n]+?\*|`[^`\n]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("__")) {
      nodes.push(<u key={`${keyPrefix}-${key++}`}>{token.slice(2, -2)}</u>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`${keyPrefix}-${key++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={`${keyPrefix}-${key++}`}>{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) {
        nodes.push(
          <a key={`${keyPrefix}-${key++}`} href={link[2]} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

function isListLine(line: string): boolean {
  return /^\s*(?:[-*]\s+|\d+\.\s+)/.test(line);
}

function renderText(text: string, headingIds: Array<{ lineIndex: number; id: string }>): ReactNode[] {
  const lines = text.replace(/\r\n?/g, "\n").replace(/<br\s*\/?>/gi, "\n\n").split("\n");
  const idsByLine = new Map(headingIds.map(({ lineIndex, id }) => [lineIndex, id]));
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^\s*(#{1,3})\s+(.+)$/);
    if (heading) {
      const content = renderInline(heading[2], `heading-${index}`);
      const key = `heading-${index}`;
      nodes.push(
        heading[1].length === 3
          ? <h3 id={idsByLine.get(index)} key={key}>{content}</h3>
          : <h2 id={idsByLine.get(index)} key={key}>{content}</h2>,
      );
      index += 1;
      continue;
    }

    if (isListLine(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: ReactNode[] = [];
      while (index < lines.length && isListLine(lines[index]) && /^\s*\d+\.\s+/.test(lines[index]) === ordered) {
        const item = lines[index].replace(/^\s*(?:[-*]\s+|\d+\.\s+)/, "");
        items.push(<li key={`list-${index}`}>{renderInline(item, `list-${index}`)}</li>);
        index += 1;
      }
      nodes.push(ordered ? <ol key={`ordered-${index}`}>{items}</ol> : <ul key={`unordered-${index}`}>{items}</ul>);
      continue;
    }

    nodes.push(<p key={`paragraph-${index}`}>{renderInline(line.trim(), `paragraph-${index}`)}</p>);
    index += 1;
  }

  return nodes;
}

export default function ArticleRichText({
  text,
  fontSize,
  headingIds = [],
}: {
  text: string;
  fontSize: number;
  headingIds?: Array<{ lineIndex: number; id: string }>;
}) {
  return (
    <div className="article-paragraph" style={{ fontSize: `${fontSize}px` }}>
      {renderText(text, headingIds)}
    </div>
  );
}
