import { useMemo } from 'react';
import './EditorialContent.css';

function contentWithIndex(html) {
  if (typeof DOMParser === 'undefined') return { html, headings: [] };
  const document = new DOMParser().parseFromString(html, 'text/html');
  const usedIds = new Set([...document.body.querySelectorAll('[id]')].filter((element) => !element.matches('h2, h3')).map((element) => element.id));
  const headings = [];

  for (const heading of document.body.querySelectorAll('h2, h3')) {
    const text = heading.textContent.trim();
    if (!text) continue;
    const slug = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const baseId = heading.id || `entrada-${slug || headings.length + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    heading.id = id;
    headings.push({ id, text, level: Number(heading.tagName.slice(1)) });
  }

  return { html: document.body.innerHTML, headings };
}

export function EditorialContent({ html = '', withIndex = false, className = '' }) {
  const content = useMemo(() => withIndex ? contentWithIndex(html) : { html, headings: [] }, [html, withIndex]);

  return <>
    {content.headings.length > 0 && <nav className="dipe-editorial-index" aria-label="Índice de contenidos">
      <h2>Índice de contenidos:</h2>
      <ul>{content.headings.map((heading) => <li key={heading.id} className={heading.level === 3 ? 'dipe-editorial-index__subheading' : undefined}>
        <a href={`#${encodeURIComponent(heading.id)}`}>{heading.text}</a>
      </li>)}</ul>
    </nav>}
    <div className={`dipe-editorial-content ${className}`.trim()} dangerouslySetInnerHTML={{ __html: content.html }} />
  </>;
}
