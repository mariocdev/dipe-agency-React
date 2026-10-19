import { useEffect, useId, useRef, useState } from 'react';
import { FitText } from '../../components/content/FitText';
import { formatPostDate } from '../../components/blog/BlogSection';
import { getPostCategories, plainText, postCardImage, postPrimaryCategory } from '../../lib/api';
import { sitePath } from '../../lib/site';
import { blogMedia } from './blogMedia';

export function BlogArchiveHero({ title = 'Blog', description = <>Tendencias en desarrollo web, SEO técnico, UX y<br className="dipe-blog-archive__hero-break" /> analítica para mejorar tu sitio.</> }) {
  const [titleFontSize, setTitleFontSize] = useState(null);

  return <header className="dipe-blog-archive__hero" style={blogMedia.heroBackground ? { backgroundImage: `url("${blogMedia.heroBackground}")` } : undefined}>
    <div className="dipe-blog-archive__container">
      <FitText as="h1" onSizeChange={setTitleFontSize}>{title}</FitText>
      <FitText as="p" maxFontSize={titleFontSize === null ? undefined : titleFontSize - 6}>{description}</FitText>
    </div>
  </header>;
}

function BlogCategoryPanel({ selectedCategoryId, onCategoryChange, isOpen, panelId }) {
  const [state, setState] = useState({ loading: true, categories: [], error: false });

  useEffect(() => {
    let active = true;
    getPostCategories().then(
      (categories) => { if (active) setState({ loading: false, categories, error: false }); },
      () => { if (active) setState({ loading: false, categories: [], error: true }); },
    );
    return () => { active = false; };
  }, []);

  return <div className={`dipe-blog-filter__panel${isOpen ? ' is-open' : ''}`} id={panelId} inert={!isOpen ? true : undefined}>
      <div className="dipe-blog-filter__clip">
        <div className="dipe-blog-filter__content" role="group" aria-label="Filtrar entradas por categoría">
          {state.loading && <p role="status">Cargando categorías…</p>}
          {state.error && <p role="alert">No se han podido cargar las categorías. Puedes seguir leyendo las entradas.</p>}
          {!state.loading && !state.error && <ul>
            <li><button type="button" aria-pressed={!selectedCategoryId} onClick={() => onCategoryChange(null)}>Todas las entradas</button></li>
            {state.categories.map((category) => <li key={category.id}>
              <button type="button" aria-pressed={category.id === selectedCategoryId} onClick={() => onCategoryChange(category.id)}>{plainText(category.name)}</button>
            </li>)}
          </ul>}
          {!state.loading && !state.error && state.categories.length === 0 && <p>Todavía no hay categorías con entradas.</p>}
        </div>
      </div>
  </div>;
}

function FilterChevron() {
  return <svg className="dipe-blog-filter__chevron" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="m4 7 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function BlogArchiveFilters({ filters, onChange, onReset, hasFilters, showCategories }) {
  const filterId = useId();
  const categoryTriggerRef = useRef(null);
  const dateTriggerRef = useRef(null);
  const [openPanel, setOpenPanel] = useState(null);
  const formatDate = (value) => value.split('-').reverse().join('/');
  const label = filters.from && filters.to
    ? `${formatDate(filters.from)} – ${formatDate(filters.to)}`
    : filters.from ? `Desde ${formatDate(filters.from)}`
      : filters.to ? `Hasta ${formatDate(filters.to)}` : 'Filtrar por fecha';

  function closeAndFocus() {
    setOpenPanel(null);
    const triggerRef = openPanel === 'date' ? dateTriggerRef : categoryTriggerRef;
    triggerRef.current?.focus();
  }

  return <div className="dipe-blog-filter" onKeyDown={(event) => {
    if (event.key === 'Escape' && openPanel) {
      event.stopPropagation();
      event.preventDefault();
      closeAndFocus();
    }
  }}>
    <div className="dipe-blog-archive__toolbar">
      {showCategories && <button
        ref={categoryTriggerRef}
        className="dipe-blog-filter__trigger"
        type="button"
        aria-expanded={openPanel === 'category'}
        aria-controls={`${filterId}-categories`}
        onClick={() => setOpenPanel((current) => current === 'category' ? null : 'category')}
      >Filtrar por categoría <FilterChevron /></button>}
      <label className="dipe-blog-archive__search">
        <span>Buscar entradas</span>
        <input type="search" placeholder="¿Qué quieres leer?" value={filters.search} onChange={(event) => onChange('search', event.target.value)} />
      </label>
      <button
        ref={dateTriggerRef}
        className="dipe-blog-filter__trigger"
        type="button"
        aria-expanded={openPanel === 'date'}
        aria-controls={`${filterId}-dates`}
        aria-label={filters.from || filters.to ? `Filtrar por fecha: ${label}` : undefined}
        onClick={() => setOpenPanel((current) => current === 'date' ? null : 'date')}
      >{label} <FilterChevron /></button>
      {hasFilters && <button className="dipe-blog-archive__reset" type="button" onClick={onReset}>Limpiar filtros</button>}
    </div>
    {showCategories && <BlogCategoryPanel
      selectedCategoryId={filters.categoryId}
      onCategoryChange={(categoryId) => onChange('categoryId', categoryId)}
      isOpen={openPanel === 'category'}
      panelId={`${filterId}-categories`}
    />}
    <div className={`dipe-blog-filter__panel${openPanel === 'date' ? ' is-open' : ''}`} id={`${filterId}-dates`} inert={openPanel !== 'date' ? true : undefined}>
      <div className="dipe-blog-filter__clip">
        <div className="dipe-blog-filter__content dipe-blog-date-filter__content" role="group" aria-label="Rango de fechas de las entradas">
          <label>
            <span>Desde</span>
            <input type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => onChange('from', event.target.value)} />
          </label>
          <label>
            <span>Hasta</span>
            <input type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => onChange('to', event.target.value)} />
          </label>
          <button className="dipe-blog-archive__reset dipe-blog-date-filter__close" type="button" onClick={closeAndFocus}>Listo</button>
        </div>
      </div>
    </div>
  </div>;
}

export function BlogArchiveCard({ post }) {
  const category = postPrimaryCategory(post);
  const image = postCardImage(post);
  const title = plainText(post.title?.rendered);
  const href = sitePath(post.link);

  return <article className="dipe-blog-archive-card">
    <a className="dipe-blog-archive-card__image" href={href} aria-label={`Leer ${title}`}>
      {image && <img src={image.url} alt={image.alt} loading="lazy" decoding="async" />}
    </a>
    <div className="dipe-blog-archive-card__content">
      <div className="dipe-blog-archive-card__meta">
        {category && <a className="dipe-blog-archive-card__category" href={sitePath(category.link)}>{plainText(category.name)}</a>}
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      </div>
      <h2><a href={href}>{title}</a></h2>
    </div>
  </article>;
}
