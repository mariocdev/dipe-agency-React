import { useEffect, useRef, useState } from 'react';
import { getCategory, getPostArchive, plainText } from '../../lib/api';
import { sitePath } from '../../lib/site';
import { BlogArchiveCard, BlogArchiveHero, BlogArchiveFilters } from './BlogArchiveSections';
import './BlogArchive.css';

const postsPerPage = 8;
const initialState = { loading: true, posts: [], page: 1, totalPages: 1, error: null, loadingMore: false };
const emptyFilters = { search: '', from: '', to: '', categoryId: null };

function BlogArchiveListing({ category, initialSearch = '' }) {
  const [state, setState] = useState(initialState);
  const [filters, setFilters] = useState(() => ({ ...emptyFilters, search: initialSearch }));
  const requestVersion = useRef(0);
  const requestController = useRef(null);
  const loadingMore = useRef(false);
  const hasFilters = Boolean(filters.search || filters.from || filters.to || filters.categoryId);
  const validDates = !filters.from || !filters.to || filters.from <= filters.to;
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
    loadingMore.current = false;
    if (!validDates) {
      setState({ ...initialState, loading: false });
      return () => { controller.abort(); requestVersion.current += 1; };
    }
    setState((current) => ({ ...current, loading: true, loadingMore: false, error: null }));

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

  async function loadMore() {
    if (loadingMore.current || state.loading || !validDates || state.page >= state.totalPages) return;
    const version = requestVersion.current;
    loadingMore.current = true;
    setState((current) => ({ ...current, loadingMore: true, error: null }));
    try {
      const nextPage = state.page + 1;
      const result = await getPostArchive({ ...query, page: nextPage, signal: requestController.current?.signal });
      if (version === requestVersion.current) setState((current) => ({ ...current, posts: [...current.posts, ...result.posts], page: nextPage, totalPages: result.totalPages, loadingMore: false }));
    } catch (error) {
      if (version === requestVersion.current && error.name !== 'AbortError') setState((current) => ({ ...current, error, loadingMore: false }));
    } finally {
      if (version === requestVersion.current) loadingMore.current = false;
    }
  }

  return <>
    <BlogArchiveFilters
      filters={filters}
      onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
      onReset={() => setFilters(emptyFilters)}
      hasFilters={hasFilters}
      showCategories={!category}
    />
    {!validDates && <p className="dipe-blog-archive__message" role="alert">La fecha «Hasta» debe ser igual o posterior a «Desde».</p>}
    <p className="visually-hidden" role="status">{state.loading ? 'Cargando entradas…' : !state.error && validDates && state.posts.length > 0 ? `${state.posts.length} entradas mostradas.` : ''}</p>
    <div aria-busy={state.loading || state.loadingMore}>
      {state.error && <p className="dipe-blog-archive__message" role="alert">{state.posts.length ? 'No se han podido cargar más entradas. Puedes volver a intentarlo.' : 'No se han podido cargar las entradas.'}</p>}
      {!state.loading && !state.error && validDates && state.posts.length === 0 && <p className="dipe-blog-archive__message" role="status">{hasFilters ? 'No hay entradas que coincidan con estos filtros.' : 'Todavía no hay entradas en esta sección.'}</p>}
      {state.posts.length > 0 && <div className="dipe-blog-archive__grid">
        {state.posts.map((post) => <BlogArchiveCard key={post.id} post={post} />)}
      </div>}
      {state.page < state.totalPages && <button className="dipe-blog-archive__more" type="button" onClick={loadMore} disabled={state.loading || state.loadingMore}>
        {state.loadingMore ? 'Cargando…' : 'Cargar más entradas'}
      </button>}
    </div>
  </>;
}

export function BlogArchive({ categorySlug = null, searchTerm = null }) {
  const [state, setState] = useState({ loading: Boolean(categorySlug), category: null, error: null });

  useEffect(() => {
    let active = true;
    if (!categorySlug) {
      setState({ loading: false, category: null, error: null });
      return undefined;
    }
    setState({ loading: true, category: null, error: null });
    getCategory(categorySlug).then(
      (category) => { if (active) setState({ loading: false, category, error: null }); },
      (error) => { if (active) setState({ loading: false, category: null, error }); },
    );
    return () => { active = false; };
  }, [categorySlug]);

  return <div className="dipe-blog-archive">
    <BlogArchiveHero
      title={searchTerm !== null ? 'Resultados de búsqueda' : undefined}
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
