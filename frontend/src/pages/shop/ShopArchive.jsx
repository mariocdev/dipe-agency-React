import { useEffect, useRef, useState } from 'react';
import { plainText } from '../../lib/api';
import { readShopFilters, shopFilterUrl, productQuery, storeRequest, getShopFilters, formatShopMoney, commerceConfig } from '../../lib/commerce';
import { ArchiveLoadingOverlay } from '../../components/content/ArchiveLoadingOverlay';
import { useArchiveGridFeedback } from '../../hooks/useArchiveGridFeedback';
import { ShopHero, ShopBreadcrumbs, ShopProductCard, ShopIcon, ShopMessage } from './ShopShared';
import { ShopArchiveFilters } from './ShopArchiveFilters';
import { useWishlist, WishlistIcon } from './Wishlist';

const emptyFilters = { search: '', min: '', max: '', stock: false, colors: [], sizes: [], order: 'collection', page: 1, favorites: false };

export function ShopArchive({ context }) {
  const wishlist = useWishlist();
  const [filters, setFilters] = useState(readShopFilters);
  const [search, setSearch] = useState(filters.search);
  const [metadata, setMetadata] = useState({ loading: true, categories: [], attributes: [], partial: false });
  const [state, setState] = useState({ loading: true, items: [], total: 0, pages: 1, error: null });
  const [revision, setRevision] = useState(0);
  const toolbarRef = useRef(null);
  const query = productQuery(filters, context, wishlist.ids).toString();
  const wishlistLoading = filters.favorites && wishlist.loading;
  const wishlistEmpty = filters.favorites && !wishlist.ids.length;
  const wishlistError = filters.favorites && wishlist.signedIn ? wishlist.error : null;
  const validPrices = !filters.min || !filters.max || Number(filters.min) <= Number(filters.max);
  const { resultsRef, showLoader } = useArchiveGridFeedback({ content: state.items, loading: state.loading, error: state.error, enabled: validPrices, scrollTargetRef: toolbarRef });

  useEffect(() => {
    const pop = () => setFilters(readShopFilters());
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => setSearch(filters.search), [filters.search]);
  useEffect(() => {
    const controller = new AbortController();
    if (wishlistLoading) {
      setState({ loading: true, items: [], total: 0, pages: 1, error: null });
      return () => controller.abort();
    }
    if (wishlistError) {
      setState({ loading: false, items: [], total: 0, pages: 1, error: new Error(wishlistError) });
      return () => controller.abort();
    }
    if (wishlistEmpty) {
      setState({ loading: false, items: [], total: 0, pages: 1, error: null });
      return () => controller.abort();
    }
    getShopFilters(controller.signal, context).then(
      (result) => { if (!controller.signal.aborted) setMetadata({ ...result, loading: false }); },
      (error) => { if (error.name !== 'AbortError') setMetadata({ loading: false, categories: [], attributes: [], partial: true }); },
    );
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    if (!validPrices) {
      setState({ loading: false, items: [], total: 0, pages: 1, error: null });
      return () => controller.abort();
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    storeRequest('products', { params: query, signal: controller.signal }).then(
      ({ data, total, pages }) => { if (!controller.signal.aborted) setState({ loading: false, items: data, total, pages, error: null }); },
      (error) => { if (!controller.signal.aborted) setState({ loading: false, items: [], total: 0, pages: 1, error }); },
    );
    return () => controller.abort();
  }, [query, revision, validPrices, wishlistLoading, wishlistEmpty, wishlistError]);

  function update(patch) {
    const next = { ...filters, page: 1, ...patch };
    window.history.pushState({}, '', shopFilterUrl(next));
    setFilters(next);
  }
  const activeFilters = [];
  if (filters.favorites) activeFilters.push({ label: 'Lista de deseos', reset: { favorites: false } });
  if (filters.search) activeFilters.push({ label: `Buscar: ${filters.search}`, reset: { search: '' } });
  const priceLabel = (value) => formatShopMoney(Math.round(Number(value) * 10 ** Number(commerceConfig.priceDecimals ?? 2)));
  if (filters.min) activeFilters.push({ label: `Desde ${priceLabel(filters.min)}`, reset: { min: '' } });
  if (filters.max) activeFilters.push({ label: `Hasta ${priceLabel(filters.max)}`, reset: { max: '' } });
  if (filters.stock) activeFilters.push({ label: 'Disponibles', reset: { stock: false } });
  for (const [key, taxonomy] of [['colors', 'pa_color'], ['sizes', 'pa_talla']]) {
    for (const value of filters[key]) {
      const term = metadata.attributes.find((attribute) => attribute.taxonomy === taxonomy)?.terms.find((item) => item.slug === value);
      activeFilters.push({ label: plainText(term?.name || value), reset: { [key]: filters[key].filter((item) => item !== value) } });
    }
  }
  const title = context.type === 'shop' ? undefined : plainText(context.name);
  const pageNumbers = [...new Set([1, ...Array.from({ length: 5 }, (_, index) => filters.page - 2 + index).filter((page) => page > 1 && page < state.pages), state.pages])];

  return <>
    <ShopHero title={title} description={context.type === 'shop' ? undefined : plainText(context.description) || 'Explora esta selección y encuentra el diseño que va contigo.'} />
    <section className="dipe-shop__catalog dipe-shop__container" aria-label="Catálogo de productos">
      <ShopBreadcrumbs items={context.type === 'shop' ? [] : [{ label: title }]} />
      <div className="dipe-shop__catalog-layout">
        <ShopArchiveFilters filters={filters} metadata={metadata} context={context} onChange={update} onReset={() => update(emptyFilters)} />
        <div className="dipe-shop__listing">
          <div className="dipe-shop__toolbar" ref={toolbarRef}>
            <form className="dipe-shop__search" role="search" onSubmit={(event) => { event.preventDefault(); update({ search }); }}><label className="visually-hidden" htmlFor="dipe-shop-search">Buscar productos</label><input id="dipe-shop-search" type="search" placeholder="¿Qué estás buscando?" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit" aria-label="Buscar productos"><ShopIcon name="search" /></button></form>
            <label className="dipe-shop__sort"><span className="visually-hidden">Ordenar productos</span><select value={filters.order} onChange={(event) => update({ order: event.target.value })}><option value="collection">Orden de la colección</option><option value="newest">Novedades</option><option value="price">Precio: de menor a mayor</option><option value="price-desc">Precio: de mayor a menor</option></select></label>
          </div>
          <div className="dipe-shop__wishlist-toolbar"><button type="button" className="dipe-shop__wishlist-link" aria-pressed={filters.favorites} onClick={() => update({ favorites: !filters.favorites })}><WishlistIcon />Lista de deseos</button></div>
          <div className="dipe-shop__result-heading"><h2>{filters.favorites ? 'Tu lista de deseos' : context.type === 'shop' ? 'Nuestra colección' : title}</h2><p role="status">{state.loading ? 'Buscando productos…' : `${state.total} ${state.total === 1 ? 'producto' : 'productos'}`}</p></div>
          {filters.favorites && <p className="dipe-shop__wishlist-hint">{wishlist.signedIn ? 'Tus favoritos se guardan en tu cuenta.' : <>Tus favoritos se conservan durante esta sesión. <a href={commerceConfig.accountUrl}>Accede a tu cuenta</a> para guardarlos también en ella.</>}</p>}
          {activeFilters.length > 0 && <div className="dipe-shop__active-filters" aria-label="Filtros activos">{activeFilters.map((filter) => <button key={filter.label} type="button" onClick={() => update(filter.reset)} aria-label={`Quitar filtro ${filter.label}`}>{filter.label}<ShopIcon name="close" /></button>)}<button type="button" className="dipe-shop__text-button" onClick={() => update(emptyFilters)}>Limpiar todos</button></div>}
          {!validPrices && <p className="dipe-shop__error" role="alert">El precio máximo debe ser igual o mayor que el mínimo. Ajusta el rango o limpia los filtros.</p>}
          <div className="dipe-shop__results dipe-archive-loading-surface" ref={resultsRef} aria-busy={state.loading}>
            {state.loading && !state.items.length && <div className="dipe-shop__grid" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div className="dipe-shop__skeleton" key={index}><div /><span /><span /></div>)}</div>}
            {state.error && <ShopMessage title={wishlistError ? 'No hemos podido cargar tu lista' : 'No hemos podido cargar los productos'} retry={() => wishlistError ? wishlist.refresh() : filters.page > 1 ? update({ page: 1 }) : setRevision((value) => value + 1)}><p>Vuelve a intentarlo en unos instantes.</p></ShopMessage>}
            {!state.loading && !state.error && validPrices && !state.items.length && <ShopMessage title={wishlistEmpty ? 'Tu lista está esperando favoritos' : activeFilters.length ? 'No encontramos esa combinación' : 'La colección está en camino'}><p>{wishlistEmpty ? 'Pulsa el corazón de los productos que quieras guardar.' : activeFilters.length ? 'Prueba con otros filtros o explora todos los productos de esta sección.' : 'Todavía no hay productos disponibles en esta sección.'}</p>{activeFilters.length > 0 && <button type="button" className="dipe-shop-button dipe-shop-button--outline" onClick={() => update(emptyFilters)}>{wishlistEmpty ? 'Explorar productos' : 'Limpiar filtros'}<ShopIcon /></button>}</ShopMessage>}
            {state.items.length > 0 && <div className="dipe-shop__grid">{state.items.map((product) => <ShopProductCard key={product.id} product={product} />)}</div>}
            <ArchiveLoadingOverlay active={showLoader} />
          </div>
          {!state.error && state.pages > 1 && <nav className="dipe-shop__pagination" aria-label="Paginación de productos"><button type="button" aria-label="Página anterior" disabled={state.loading || filters.page <= 1} onClick={() => update({ page: filters.page - 1 })}>←</button>{pageNumbers.map((page, index) => <span key={page}>{index > 0 && page > pageNumbers[index - 1] + 1 && <span className="dipe-shop__pagination-gap">…</span>}<button type="button" disabled={state.loading} aria-current={page === filters.page ? 'page' : undefined} onClick={() => update({ page })}>{page}</button></span>)}<button type="button" aria-label="Página siguiente" disabled={state.loading || filters.page >= state.pages} onClick={() => update({ page: filters.page + 1 })}>→</button></nav>}
        </div>
      </div>
    </section>
  </>;
}
