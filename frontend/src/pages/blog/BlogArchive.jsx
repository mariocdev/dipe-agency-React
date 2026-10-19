import { useEffect, useRef, useState } from 'react';
import { getCategory, getPostArchive, plainText } from '../../lib/api';
import { siteConfig, sitePath } from '../../lib/site';
import { useEqualizedBlockSize } from '../../hooks/useEqualizedBlockSize';
import { useArchiveGridFeedback } from '../../hooks/useArchiveGridFeedback';
import { ArchiveLoadingOverlay } from '../../components/content/ArchiveLoadingOverlay';
import { BlogArchiveCard, BlogArchiveHero, BlogArchiveFilters } from './BlogArchiveSections';
import './BlogArchive.css';

const postsPerPage = 8;
const initialState = { loading: true, posts: [], page: 1, totalPages: 1, error: null, loadingPage: false };
const emptyFilters = { search: '', from: '', to: '', categoryId: null };
const verticalCardMedia = '(max-width: 1500px) and (width > 767px)';

// Coordina filtros, peticiones y paginación conservando las tarjetas durante la carga.
function BlogArchiveListing({ category, initialSearch = '' }) {
  const [state, setState] = useState(initialState);
  const [filters, setFilters] = useState(() => ({ ...emptyFilters, search: initialSearch }));
  const gridRef = useEqualizedBlockSize('.dipe-blog-archive-card h2', state.posts, verticalCardMedia);
  const metadataRef = useEqualizedBlockSize('.dipe-blog-archive-card__meta', state.posts, verticalCardMedia);
  const requestVersion = useRef(0);
  const requestController = useRef(null);
  const loadingPage = useRef(false);
  const hasFilters = Boolean(filters.search || filters.from || filters.to || filters.categoryId);
  const validDates = !filters.from || !filters.to || filters.from <= filters.to;
  const filtersRef = useRef(null);
  const { resultsRef, showLoader } = useArchiveGridFeedback({
    content: state.posts,
    loading: state.loading || state.loadingPage,
    error: state.error,
    enabled: validDates,
    scrollTargetRef: filtersRef,
  });
  const query = {
    categoryId: category?.id || filters.categoryId,
    search: filters.search.trim(),
    after: filters.from ? `${filters.from}T00:00:00` : '',
    before: filters.to ? `${filters.to}T23:59:59` : '',
    perPage: postsPerPage,
  };

  useEffect(() => {
    const version = ++requestVersion.current;
    const controller = new AbortController();
    requestController.current = controller;
    loadingPage.current = false;
    if (!validDates) {
      setState({ ...initialState, loading: false });
      return () => { controller.abort(); requestVersion.current += 1; };
    }
    setState((current) => ({ ...current, loading: true, loadingPage: false, error: null }));

    const timer = window.setTimeout(() => {
      getPostArchive({ ...query, signal: controller.signal }).then(
        (result) => {
          if (version === requestVersion.current) setState({ ...initialState, loading: false, posts: result.posts, totalPages: result.totalPages });
        },
        (error) => {
          if (version === requestVersion.current && error.name !== 'AbortError') setState({ ...initialState, loading: false, error });
        },
      );
    }, query.search ? 250 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
      requestVersion.current += 1;
    };
  }, [query.categoryId, query.search, query.after, query.before, validDates]);

  // Pide la página elegida conservando los filtros y evitando peticiones solapadas.
  async function goToPage(page) {
    if (loadingPage.current || state.loading || !validDates || page === state.page || page < 1 || page > state.totalPages) return;
    const version = requestVersion.current;
    loadingPage.current = true;
    setState((current) => ({ ...current, loadingPage: true, error: null }));
    try {
      const result = await getPostArchive({ ...query, page, signal: requestController.current?.signal });
      if (version === requestVersion.current) setState((current) => ({ ...current, posts: result.posts, page, totalPages: result.totalPages, loadingPage: false }));
    } catch (error) {
      if (version === requestVersion.current && error.name !== 'AbortError') setState((current) => ({ ...current, error, loadingPage: false }));
    } finally {
      if (version === requestVersion.current) loadingPage.current = false;
    }
  }

  return <>
    <div className="dipe-blog-archive__filter-anchor" ref={filtersRef}>
      <BlogArchiveFilters
        filters={filters}
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        onReset={() => setFilters(emptyFilters)}
        hasFilters={hasFilters}
        showCategories={!category}
      />
    </div>
    {!validDates && <p className="dipe-blog-archive__message" role="alert">La fecha «Hasta» debe ser igual o posterior a «Desde».</p>}
    <p className="visually-hidden" role="status">{state.loading || state.loadingPage ? 'Cargando entradas…' : !state.error && validDates && state.posts.length > 0 ? `Página ${state.page} de ${state.totalPages}. ${state.posts.length} entradas mostradas.` : ''}</p>
    <div aria-busy={state.loading || state.loadingPage} ref={metadataRef}>
      <div className="dipe-blog-archive__results dipe-archive-loading-surface" ref={resultsRef}>
        {state.error && <p className="dipe-blog-archive__message" role="alert">{state.posts.length ? 'No se ha podido cargar la página de entradas. Puedes volver a intentarlo.' : 'No se han podido cargar las entradas.'}</p>}
        {!state.loading && !state.error && validDates && state.posts.length === 0 && <p className="dipe-blog-archive__message" role="status">{hasFilters ? 'No hay entradas que coincidan con estos filtros.' : 'Todavía no hay entradas en esta sección.'}</p>}
        {state.posts.length > 0 && <div className="dipe-blog-archive__grid" ref={gridRef}>
          {state.posts.map((post) => <BlogArchiveCard key={post.id} post={post} />)}
        </div>}
        <ArchiveLoadingOverlay active={showLoader} />
      </div>
      {state.totalPages > 1 && <nav className="dipe-blog-archive__pagination" aria-label="Paginación del blog">
        {Array.from({ length: state.totalPages }, (_, index) => index + 1).map((number) => <button
          className="dipe-blog-archive__page"
          type="button"
          key={number}
          aria-label={`Página ${number}`}
          aria-current={number === state.page ? 'page' : undefined}
          disabled={state.loading || state.loadingPage || showLoader || !validDates}
          onClick={() => goToPage(number)}
        >
          {number}
        </button>)}
      </nav>}
    </div>
  </>;
}

// Prepara el archivo general, de categoría o de búsqueda según la ruta.
export function BlogArchive({ categorySlug = null, searchTerm = null, onNotFound }) {
  const initialCategory = categorySlug && siteConfig.blogCategory?.slug === categorySlug
    ? siteConfig.blogCategory
    : null;
  const [state, setState] = useState(() => ({ loading: Boolean(categorySlug && !initialCategory), category: initialCategory, error: null }));

  useEffect(() => {
    let active = true;
    if (!categorySlug) {
      setState({ loading: false, category: null, error: null });
      return undefined;
    }
    if (initialCategory) {
      setState({ loading: false, category: initialCategory, error: null });
      return undefined;
    }
    setState({ loading: true, category: null, error: null });
    getCategory(categorySlug).then(
      (category) => { if (active) setState({ loading: false, category, error: null }); },
      (error) => { if (active) setState({ loading: false, category: null, error }); },
    );
    return () => { active = false; };
  }, [categorySlug, initialCategory]);

  if (categorySlug && !state.loading && !state.error && !state.category && onNotFound) return onNotFound();

  return <div className="dipe-blog-archive">
    <BlogArchiveHero
      title={categorySlug
        ? (state.category ? plainText(state.category.name) : '\u00a0')
        : searchTerm !== null ? 'Resultados de búsqueda' : undefined}
      description={searchTerm !== null ? 'Encuentra contenidos del blog por tema, categoría o fecha.' : undefined}
    />
    <section className="dipe-blog-archive__listing dipe-blog-archive__container" aria-label="Entradas del blog">
      {categorySlug && <div className="dipe-blog-archive__selection">
        <a href={sitePath('/blog/')}>← Todas las entradas</a>
        {state.category && <p>Categoría: <strong>{plainText(state.category.name)}</strong></p>}
      </div>}
      {state.loading && <p className="dipe-blog-archive__message" role="status">Cargando categoría…</p>}
      {state.error && <p className="dipe-blog-archive__message" role="alert">No se ha podido cargar la categoría.</p>}
      {!state.loading && !state.error && (categorySlug && !state.category
        ? <h2>Categoría no encontrada</h2>
        : <BlogArchiveListing key={`${categorySlug || 'all'}-${searchTerm || ''}`} category={state.category} initialSearch={searchTerm || ''} />)}
    </section>
  </div>;
}
